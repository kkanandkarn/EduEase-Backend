const { ErrorHandler } = require("../../../helper");
const { SERVER_ERROR } = require("../../../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");
const { fileUpload } = require("../file-upload/file-uploads");
const { formidableUpload } = require("../file-upload/upload-to-cloud");

const createTenant = async (req) => {
  try {
    const { files, fields } = await formidableUpload(req);
    req.user.tenant = 1;
    req.body.programCode = "TENANT_DETAILS";
    const { uploadedFile } = await fileUpload(files);
    console.log("fields: ", fields);
    console.log("uploaded file: ", uploadedFile);
    return { message: "Tenant created successfully" };
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
