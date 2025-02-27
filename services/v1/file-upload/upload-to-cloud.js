const formidable = require("formidable");
const { ErrorHandler } = require("../../../helper");
const { SERVER_ERROR } = require("../../../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");
const { FILE_UPLOAD_PATH } = process.env;
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");

const formidableUpload = async (req) => {
  try {
    const form = new formidable.IncomingForm({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024,
      maxFieldsSize: 2 * 1024 * 1024,
    });
    form.keepExtensions = true;
    form.on("error", (e) => console.log(e));
    form.on("aborted", () => console.log("aborted"));
    const formfields = await new Promise(function (resolve, reject) {
      form.parse(req, function (err, fields, files) {
        if (err) {
          reject(err);
          return;
        }

        resolve({ fields, files });
      });
    });

    return formfields;
  } catch (error) {
    if (error.httpCode) {
      throw new ErrorHandler(error.httpCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const randomUpload = async (req, files, key = "document") => {
  try {
    const tenantId = req.user.tenant;
    const folderPath = path.join(`${FILE_UPLOAD_PATH}/${tenantId}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const uniqueId = await generateUniqueId();

    let fileName = uniqueId + path.extname(files[key].originalFilename);
    await fsPromises.copyFile(files[key].filepath, `${folderPath}/${fileName}`);

    const url = `${process.env.BACKEND_URL}/uploads/${tenantId}/${fileName}`;
    const filePath = `${tenantId}/${fileName}`;

    const fileSize = parseFloat((files[key].size / 1024 / 1024).toFixed(2));

    return {
      message: "success",
      url: url,
      name: files[key].originalFilename,
      path: filePath,
      mimeType: files[key].mimetype,
      size: fileSize,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

async function generateUniqueId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  const uniqueId = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;

  return uniqueId;
}

module.exports = {
  formidableUpload,
  randomUpload,
  generateUniqueId,
};
