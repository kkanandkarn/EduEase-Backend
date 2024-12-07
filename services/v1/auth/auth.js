const sequelize = require("../../../config/db");
const { ErrorHandler, statusCodes } = require("../../../helper");
const {
  SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} = require("../../../helper/status-codes");
const { transactionFunction } = require("../../../helper/transaction");

const { SERVER_ERROR_MSG, status } = require("../../../utils/constant");
const { compare } = require("../../../utils/hash");
const token = require("../../../utils/token");

const login = async (req) => {
  try {
    const { password } = req.body;

    const data = await transactionFunction("GET-USER-DATA", req.body);

    if (!data.length) {
      throw new ErrorHandler(NOT_FOUND, "User with this email not found.");
    }
    let user = data[0];
    if (user.status === status.SUSPENDED || user.status === status.DELETED) {
      throw new ErrorHandler(
        UNAUTHORIZED,
        "Account Suspended. Contact your administrator for further information."
      );
    }

    const validatePassword = await compare(user.password, password);
    if (!validatePassword) {
      throw new ErrorHandler(UNAUTHORIZED, "Invalid password");
    }

    const globalRolePermissions = await transactionFunction(
      "GET-ROLE-PERMISSIONS",
      { roleId: user.role_id }
    );

    const keysToRemove = ["password"];

    user = Object.fromEntries(
      Object.entries(user).filter(([key]) => !keysToRemove.includes(key))
    );

    return {
      message: "Login Successfully",
      user: user,
      token: token(user.user_id, user.role, user.tenant_id),
      globalRolePermissions: globalRolePermissions,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  login,
};
