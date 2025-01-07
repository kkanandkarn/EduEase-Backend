const sequelize = require("../../../config/db");
const { ErrorHandler } = require("../../../helper");
const { SERVER_ERROR, NOT_FOUND } = require("../../../helper/status-codes");
const { transactionFunction } = require("../../../helper/transaction");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");

async function addTenantPermissions(req, tenantId, permissions, transaction) {
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

  const fetchTenantPermissions = await transactionFunction(
    "GET-TENANT-PERMISSIONS",
    { tenantId },
    transaction
  );

  if (!fetchTenantPermissions.length) {
    await insertTenantPermissions(
      tenantId,
      permissions,
      userId,
      userId,
      transaction
    );
    return { message: "Permissions added successfully" };
  }

  const tenantPermissions = fetchTenantPermissions.map(
    (permission) => permission.permission_id
  );

  const { newPermissions, deletedPermissions } = await comparePermissions(
    permissions,
    tenantPermissions
  );

  if (newPermissions.length) {
    await insertTenantPermissions(
      tenantId,
      newPermissions,
      userId,
      userId,
      transaction
    );
  }

  if (deletedPermissions.length) {
    await deleteTenantPermissions(
      tenantId,
      deletedPermissions,
      userId,
      transaction
    );
  }

  return true;
}

const viewGLobalPermissions = async (req) => {
  try {
    const globalPermissions = {};
    const getPermissions = await transactionFunction("GET-GLOBAL-PERMISSIONS");

    // Group permissions by their parent property
    getPermissions.forEach((permission) => {
      if (!globalPermissions[permission.parent]) {
        globalPermissions[permission.parent] = [];
      }
      globalPermissions[permission.parent].push({
        id: permission.id,
        permission_name: permission.permission_name,
      });
    });

    return globalPermissions;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

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

async function insertTenantPermissions(
  tenantId,
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
        "CHECK-TENANT-PERMISSION-FOR-REACTIVE",
        { tenantId, permissionId },
        transaction
      );

      if (checkExistance.length) {
        await transactionFunction(
          "REACTIVE-TENANT-PERMISSION",
          { updatedBy, tenantId, permissionId },
          transaction
        );
      } else {
        await transactionFunction(
          "INSERT-TENANT-PERMISSIONS",
          {
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

async function deleteTenantPermissions(
  tenantId,
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
        "MATCH-TENANT-PERMISSION",
        { tenantId, permissionId }
      );
      if (!checkExistance.length) {
        throw new ErrorHandler(
          NOT_FOUND,
          "Tenant permission not found to delete."
        );
      }
      await transactionFunction(
        "DELETE-TENANT-PERMISSION",
        {
          updatedBy,
          tenantId,
          permissionId,
        },
        transaction
      );
    })
  );
  return true;
}

module.exports = {
  addTenantPermissions,
  viewGLobalPermissions,
};
