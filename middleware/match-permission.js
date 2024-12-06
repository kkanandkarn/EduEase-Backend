const sequelize = require("../config/db");
const { ErrorHandler } = require("../helper");
const { UNAUTHORIZED, SERVER_ERROR } = require("../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../utils/constant");

const matchPermission = async (req, role, permission) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
    }
    const Role = await sequelize.query(
      `select * from role where status != 'Deleted' and role=?`,
      {
        replacements: [role],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const Permission = await sequelize.query(
      "select id from global_permissions_master where status='Active' and permission_name	= ?",
      {
        replacements: [permission],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const roleId = Role[0].id;
    const permissionId = Permission[0].id;
    const checkPermission = await sequelize.query(
      "select * from global_role_permissions where status='Active' and permission_id = ? and role_id = ?",
      {
        replacements: [permissionId, roleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return checkPermission.length;
  } catch (error) {
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
