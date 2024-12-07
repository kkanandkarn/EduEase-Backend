const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
} = require("../../../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");
const { fileUpload } = require("../file-upload/file-uploads");
const { formidableUpload } = require("../file-upload/upload-to-cloud");
const schemas = require("../../../utils/schema");
const { transactionFunction } = require("../../../helper/transaction");

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
module.exports = {
  createTenant,
};
