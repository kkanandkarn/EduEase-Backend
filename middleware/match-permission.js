const sequelize = require("../config/db");
const { ErrorHandler } = require("../helper");
const { UNAUTHORIZED, SERVER_ERROR } = require("../helper/status-codes");
const { transactionFunction } = require("../helper/transaction");
const { SERVER_ERROR_MSG } = require("../utils/constant");

const matchPermission = async (req, role, permission) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
    }
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

    const Role = await transactionFunction("GET-ROLE-BY-NAME", { role: role });
    const roleId = Role[0].id;

    const checkPermission = await transactionFunction("MATCH-ROLE-PERMISSION", {
      permissionId: permissionId,
      roleId: roleId,
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
