const sequelize = require("../config/db");
const { ErrorHandler } = require("../helper");
const { UNAUTHORIZED, SERVER_ERROR } = require("../helper/status-codes");
const { transactionFunction } = require("../helper/transaction");
const { SERVER_ERROR_MSG } = require("../utils/constant");

const matchPermission = async (req, permission) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
    }
    const role = req.user.role;
    const tenantId = req.user.tenant;

    const Permission = await transactionFunction("GET-PERMISSION-BY-NAME", {
      permission: permission,
    });
    const permissionId = Permission[0].id;

    const checkTenantPermission = await transactionFunction(
      "MATCH-TENANT-PERMISSION",
      { tenantId: tenantId, permissionId: permissionId }
    );

    if (!checkTenantPermission.length) {
      return checkTenantPermission.length;
    }
    console.log(role);

    const checkPermission = await transactionFunction("MATCH-ROLE-PERMISSION", {
      permissionId: permissionId,
      roleId: role,
    });

    return checkPermission.length;
  } catch (error) {
    await transaction.rollback();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  matchPermission,
};
