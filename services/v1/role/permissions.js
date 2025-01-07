const sequelize = require("../../../config/db");
const { ErrorHandler } = require("../../../helper");
const { SERVER_ERROR, NOT_FOUND } = require("../../../helper/status-codes");
const { transactionFunction } = require("../../../helper/transaction");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");

async function addRolePermissions(
  req,
  tenantId,
  roleId,
  permissions,
  transaction
) {
  const userId = req.user.userId;

  const [tenant] = await transactionFunction(
    "GET-TENANT-BY-ID",
    {
      tenantId,
    },
    transaction
  );
  if (!tenant) {
    throw new ErrorHandler(NOT_FOUND, "Tenant not found");
  }

  const [role] = await transactionFunction(
    "GET-ROLE-BY-ID",
    {
      roleId,
      tenantId,
    },
    transaction
  );
  if (!role) {
    throw new ErrorHandler(NOT_FOUND, "Role not found");
  }

  const fetchRolePermissions = await transactionFunction(
    "GET-ROLE-PERMISSIONS",
    { roleId },
    transaction
  );

  if (!fetchRolePermissions.length) {
    await insertRolePermissions(
      tenantId,
      roleId,
      permissions,
      userId,
      userId,
      transaction
    );
    return { message: "Permissions added successfully" };
  }

  const rolePermissions = fetchRolePermissions.map(
    (permission) => permission.permission_id
  );

  const { newPermissions, deletedPermissions } = await comparePermissions(
    permissions,
    rolePermissions
  );

  if (newPermissions.length) {
    await insertRolePermissions(
      tenantId,
      roleId,
      newPermissions,
      userId,
      userId,
      transaction
    );
  }

  if (deletedPermissions.length) {
    await deleteRolePermissions(
      roleId,
      deletedPermissions,
      userId,
      transaction
    );
  }

  return true;
}

async function comparePermissions(reqPermissions, dbPermissions) {
  const newPermissions = reqPermissions.filter(
    (perm) => !dbPermissions.includes(perm)
  );
  const existingPermissions = reqPermissions.filter((perm) =>
    dbPermissions.includes(perm)
  );
  const deletedPermissions = dbPermissions.filter(
    (perm) => !reqPermissions.includes(perm)
  );

  return {
    newPermissions,
    existingPermissions,
    deletedPermissions,
  };
}

async function insertRolePermissions(
  tenantId,
  roleId,
  permissions,
  createdBy,
  updatedBy,
  transaction
) {
  await Promise.all(
    await permissions.map(async (permissionId) => {
      const checkPermission = await transactionFunction(
        "GET-GLOBAL-PERMISSION-BY-ID",
        { id: permissionId },
        transaction
      );
      if (!checkPermission.length) {
        throw new ErrorHandler(NOT_FOUND, "Permission not found");
      }

      const checkExistance = await transactionFunction(
        "CHECK-ROLE-PERMISSION-FOR-REACTIVE",
        { tenantId, permissionId },
        transaction
      );

      if (checkExistance.length) {
        await transactionFunction(
          "REACTIVE-ROLE-PERMISSION",
          { updatedBy, roleId, permissionId },
          transaction
        );
      } else {
        await transactionFunction(
          "INSERT-ROLE-PERMISSIONS",
          {
            roleId,
            tenantId,
            permissionId,
            createdBy,
            updatedBy,
          },
          transaction
        );
      }
    })
  );
  return true;
}

async function deleteRolePermissions(
  roleId,
  permissions,
  updatedBy,
  transaction
) {
  await Promise.all(
    await permissions.map(async (permissionId) => {
      const checkPermission = await transactionFunction(
        "GET-GLOBAL-PERMISSION-BY-ID",
        { id: permissionId },
        transaction
      );
      if (!checkPermission.length) {
        throw new ErrorHandler(NOT_FOUND, "Permission not found");
      }

      const checkExistance = await transactionFunction(
        "MATCH-ROLE-PERMISSION",
        { roleId, permissionId }
      );
      if (!checkExistance.length) {
        throw new ErrorHandler(
          NOT_FOUND,
          "Role permission not found to delete."
        );
      }
      await transactionFunction(
        "DELETE-ROLE-PERMISSION",
        {
          updatedBy,
          roleId,
          permissionId,
        },
        transaction
      );
    })
  );
  return true;
}

module.exports = {
  addRolePermissions,
};
