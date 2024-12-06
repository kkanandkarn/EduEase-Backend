const sequelize = require("../../../config/db");
const { ErrorHandler, statusCodes } = require("../../../helper");
const {
  SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} = require("../../../helper/status-codes");

const { SERVER_ERROR_MSG, status } = require("../../../utils/constant");
const { compare } = require("../../../utils/hash");

const login = async (req) => {
  try {
    const { email, password } = req.body;
    const [user] = await sequelize.query(
      `select u.*, t.*, r.*, ud.file_name, file_url from users u LEFT JOIN tenants t on t.id = u.tenant_id LEFT JOIN role r on r.id = u.role_id LEFT JOIN uploaded_documents
      ud on ud.id = t.tenant_logo where u.email =?`,
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (!user) {
      throw new ErrorHandler(NOT_FOUND, "User with this email not found.");
    }
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

    return {
      message: "Login Successfully",
      id: user.id,
      email: user.email,
      role: user.role,
      tenantName: user.tenant_name,
      tenant_logo: { fileName: user.file_name, fileUrl: user.file_url },
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
