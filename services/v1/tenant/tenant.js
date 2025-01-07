const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
} = require("../../../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");
const { fileUpload } = require("../file-upload/file-uploads");
const { formidableUpload } = require("../file-upload/upload-to-cloud");
const schemas = require("../../../utils/schema");
const { transactionFunction } = require("../../../helper/transaction");
const { getTableData } = require("../../../utils/table-data");

const sequelize = require("../../../config/db");
const { moveUploadedFile } = require("../file-upload/move-uplaod-file");
const { addTenantPermissions } = require("./permissions");

const createTenant = async (req) => {
  const transaction = await sequelize.transaction();
  try {
    const { files, fields } = await formidableUpload(req);

    const userId = req.user.userId;
    if (!files["tenantLogo"]) {
      throw new ErrorHandler(BAD_GATEWAY, "Tenant logo is required.");
    }

    const schema = schemas["tenant_create_tenant_post"];
    const { error } = schema.validate(fields);
    if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);
    const { tenantPermissions } = fields;

    const checkTenant = await transactionFunction("GET-TENANT-BY-NAME", fields);
    if (checkTenant.length) {
      throw new ErrorHandler(CONFLICT, "Tenant with this name already exists");
    }

    const { uploadedFile } = await fileUpload(req, files, "TENANT_DETAILS");
    fields.tenantLogo = uploadedFile[0].id;
    fields.createdBy = userId;
    fields.updatedBy = userId;

    const [tenantId, _] = await transactionFunction(
      "INSERT-TENANT-DETAILS",
      fields
    );

    await addTenantPermissions(
      req,
      tenantId,
      tenantPermissions.map(Number),
      transaction
    );
    await moveUploadedFile(uploadedFile[0], tenantId, transaction);
    await transaction.commit();
    return { message: "Tenant created successfully", tenantId: tenantId };
  } catch (error) {
    await transaction.rollback();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewTenants = async (req) => {
  try {
    const { headers, data, totalCount } = await getTableData(
      req,
      "TENANT_DETAILS"
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

const viewTenantById = async (req) => {
  try {
    const [tenant] = await transactionFunction("GET-TENANT-BY-ID", req.body);

    if (!tenant) {
      throw new ErrorHandler(NOT_FOUND, "Tenant not found");
    }
    const tenantPermissions = await transactionFunction(
      "GET-TENANT-PERMISSIONS",
      req.body
    );

    tenant.permissions = tenantPermissions;

    return tenant;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateTenant = async (req) => {
  const transaction = await sequelize.transaction();
  try {
    const { files, fields } = await formidableUpload(req);
    const userId = req.user.userId;

    const schema = schemas["tenant_update_tenant_post"];
    const { error } = schema.validate(fields);
    if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);

    req.body.tenantId = fields.tenantId;
    const oldTenant = await viewTenantById(req);

    if (files["tenantLogo"]) {
      const { uploadedFile } = await fileUpload(req, files, "TENANT_DETAILS");
      fields.tenantLogo = uploadedFile[0].id;
      await moveUploadedFile(uploadedFile[0], fields.tenantId, transaction);
    } else {
      fields.tenantLogo = oldTenant.tenant_logo.file_id;
    }

    const checkTenant = await transactionFunction("GET-TENANT-BY-NAME", fields);
    if (fields.tenantName !== oldTenant.tenant_name && checkTenant.length) {
      throw new ErrorHandler(CONFLICT, "Tenant with this name already exists");
    }

    fields.updatedBy = userId;

    await transactionFunction("UPDATE-TENANT-DETAILS", fields, transaction);
    await addTenantPermissions(
      req,
      fields.tenantId,
      fields.tenantPermissions.map(Number),
      transaction
    );

    await transaction.commit();
    return {
      message: "Tenant updated successfully",
      tenantId: parseInt(fields.tenantId),
    };
  } catch (error) {
    await transaction.rollback();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const getTenantPermisisons = async (req) => {
  try {
    if (!req.body.tenantId) {
      req.body.tenantId = req.user.tenant;
    }
    const permissions = {};
    let getPermissions = await transactionFunction(
      "GET-TENANT-PERMISSIONS",
      req.body
    );

    getPermissions.forEach((permission) => {
      if (!permissions[permission.parent]) {
        permissions[permission.parent] = [];
      }
      permissions[permission.parent].push({
        id: permission.id,
        permission_name: permission.permission_name,
      });
    });

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
  createTenant,
  viewTenants,
  viewTenantById,
  updateTenant,
  getTenantPermisisons,
};
