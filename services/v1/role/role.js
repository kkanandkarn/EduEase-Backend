const sequelize = require("../../../config/db");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  NOT_FOUND,
  BAD_GATEWAY,
} = require("../../../helper/status-codes");
const { transactionFunction } = require("../../../helper/transaction");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");
const { getTableData } = require("../../../utils/table-data");
const { addRolePermissions } = require("./permissions");

const createRole = async (req) => {
  const transaction = await sequelize.transaction();
  try {
    const { role } = req.body;

    const tenantId = req.body.tenantId || req.user.tenant;

    const [tenant] = await transactionFunction(
      "GET-TENANT-BY-ID",
      { tenantId },
      transaction
    );

    if (!tenant) {
      throw new ErrorHandler(NOT_FOUND, "Tenant not found");
    }

    role.tenantId = tenantId;
    const [roleId, _] = await transactionFunction(
      "INSERT-ROLE",
      role,
      transaction
    );

    const roleCount = parseInt(tenant.role_count) + 1;

    await transactionFunction(
      "UPDATE-TENANT-ROLE-COUNT",
      { roleCount, tenantId },
      transaction
    );

    await addRolePermissions(
      req,
      tenantId,
      roleId,
      role.permissions.map(Number),
      transaction
    );

    await transaction.commit();
    return { message: "Role created successfully" };
  } catch (error) {
    await transaction.rollback();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewRoles = async (req) => {
  try {
    const tenantId = req.body.tenantId || req.user.tenant;

    const { headers, data, totalCount } = await getTableData(
      req,
      "TENANT_ROLES",
      tenantId
    );
    return {
      headers,
      data,
      totalCount,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewRoleById = async (req) => {
  try {
    if (!req.body.tenantId) {
      req.body.tenantId = req.user.tenant;
    }
    const [role] = await transactionFunction("GET-ROLE-BY-ID", req.body);
    if (!role) {
      throw new ErrorHandler(NOT_FOUND, "No role found");
    }
    const permissions = await transactionFunction("GET-ROLE-PERMISSIONS", {
      roleId: role.id,
    });
    role.permissions = permissions;

    return role;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateRole = async (req) => {
  const transaction = await sequelize.transaction();
  try {
    const { role } = req.body;
    const tenantId = req.body.tenantId || req.user.tenant;
    const userId = req.user.userId;

    role.updatedBy = userId;
    await transactionFunction("UPDATE-ROLE", role, transaction);
    await addRolePermissions(
      req,
      tenantId,
      role.roleId,
      role.permissions.map(Number),
      transaction
    );

    await transaction.commit();
    return { message: "Role Updated Successfully." };
  } catch (error) {
    await transaction.rollback();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const deleteRole = async (req) => {
  try {
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const getRolePermissions = async (req) => {
  try {
    const permissions = await transactionFunction(
      "GET-ROLE-PERMISSIONS",
      req.body
    );
    return permissions;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  createRole,
  viewRoles,
  viewRoleById,
  updateRole,
  deleteRole,
  getRolePermissions,
};
