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

const createTenant = async (req) => {
  try {
    const { files, fields } = await formidableUpload(req);
    const userId = req.user.userId;
    if (!files["tenantLogo"]) {
      throw new ErrorHandler(BAD_GATEWAY, "Tenant logo is required.");
    }

    const schema = schemas["tenant_create_tenant_post"];
    const { error } = schema.validate(fields);
    if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);

    const checkTenant = await transactionFunction("GET-TENANT-BY-NAME", fields);
    if (checkTenant.length) {
      throw new ErrorHandler(CONFLICT, "Tenant with this name already exists");
    }

    const { uploadedFile } = await fileUpload(req, files, "TENANT_DETAILS");
    fields.tenantLogo = uploadedFile[0].id;
    fields.createdBy = userId;
    fields.updatedBy = userId;

    await transactionFunction("INSERT-TENANT-DETAILS", fields);
    const tenants = await transactionFunction("GET-TENANTS");

    return { message: "Tenant created successfully", tenants: tenants };
  } catch (error) {
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
  try {
    const { files, fields } = await formidableUpload(req);
    const userId = req.user.userId;

    const schema = schemas["tenant_update_tenant_post"];
    const { error } = schema.validate(fields);
    if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);

    req.body.id = fields.id;
    const oldTenant = await viewTenantById(req);

    if (files["tenantLogo"]) {
      const { uploadedFile } = await fileUpload(req, files, "TENANT_DETAILS");
      fields.tenantLogo = uploadedFile[0].id;
    } else {
      fields.tenantLogo = oldTenant.tenant_logo.fileId;
    }

    const checkTenant = await transactionFunction("GET-TENANT-BY-NAME", fields);
    if (fields.tenantName !== oldTenant.tenant_name && checkTenant.length) {
      throw new ErrorHandler(CONFLICT, "Tenant with this name already exists");
    }

    fields.updatedBy = userId;

    await transactionFunction("UPDATE-TENANT-DETAILS", fields);
    const tenants = await transactionFunction("GET-TENANTS");

    return { message: "Tenant updated successfully", tenants: tenants };
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
};
