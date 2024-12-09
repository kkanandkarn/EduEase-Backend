const sequelize = require("../../../config/db");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  UNAUTHORIZED,
  NOT_FOUND,
} = require("../../../helper/status-codes");
const { formidableUpload } = require("../../../utils");
const { SERVER_ERROR_MSG, ROLE } = require("../../../utils/constant");

const path = require("path");
const { randomUpload } = require("./upload-to-cloud");

const fileUpload = async (req, files, programCode) => {
  try {
    if (!programCode) {
      throw new ErrorHandler(BAD_GATEWAY, "Program code is required.");
    }

    let uploadedFiles = [];

    await Promise.all(
      Object.keys(files).map(async (key) => {
        const file = files[key];
        if (Array.isArray(file)) {
          uploadedFiles = await handleMultipleFiles(req, files, programCode);
        } else {
          uploadedFiles = await singleFileUpload(req, files, programCode);
        }
      })
    );

    return {
      mesage: `${
        uploadedFiles.length
          ? "File uploaded successfully."
          : "No file uploaded."
      }`,
      uploadedFile: uploadedFiles,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

async function getDocumentList(documentType) {
  try {
    const documentList = await sequelize.query(
      `SELECT id, type, description, max_file_no, allowed_mimetypes, max_size_in_mb FROM document_type WHERE program_code = ?`,
      {
        replacements: [documentType],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return documentList;
  } catch (error) {
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

async function singleFileUpload(req, files, programCode) {
  try {
    const userId = req.user.userId;
    if (!programCode) {
      throw new ErrorHandler(BAD_GATEWAY, "Program code is required.");
    }

    const documentlist = await getDocumentList(programCode);

    if (!documentlist.length) {
      throw new ErrorHandler(NOT_FOUND, "Program code not found.");
    }

    const fileKeys = Object.keys(files);

    const uploadedFiles = [];

    await Promise.all(
      await documentlist.map(async (document) => {
        const fileDesc = {};
        const file = files[document.type];

        if (fileKeys.includes(document.type)) {
          if (!document.allowed_mimetypes.includes(file.mimetype)) {
            throw new ErrorHandler(
              BAD_GATEWAY,
              `File type ${path.extname(
                file.originalFilename
              )} not allowed for ${document.type}`
            );
          }

          // Check for file size
          else if (file.size > document.max_size_in_mb * 1024 * 1024) {
            throw new ErrorHandler(
              BAD_GATEWAY,
              `File ${document.type} exceeds the allowed size limit of ${document.max_size_in_mb} MB`
            );
          } else {
            const { name, path, url, mimeType, size } = await randomUpload(
              req,
              files,
              document.type
            );
            const insertFile = await sequelize.query(
              `insert into uploaded_documents (document_type_id ,file_name, file_path, file_url, mime_type,file_size_in_mb, created_by, updated_by, created_at, updated_at)
                values (?, ?, ?, ?, ?, ?, ?, ?,  NOW(), NOW())`,
              {
                replacements: [
                  document.id,
                  name,
                  path,
                  url,
                  mimeType,
                  size,
                  userId ?? null,
                  userId ?? null,
                ],
                type: sequelize.QueryTypes.INSERT,
              }
            );
            fileDesc["id"] = insertFile[0];
            fileDesc["fileName"] = name;
            fileDesc[document.type] = url;
            fileDesc["mimeType"] = mimeType;
            fileDesc["fileSizeInMb"] = String(size);
            uploadedFiles.push(fileDesc);
          }
        }
      })
    );

    return uploadedFiles;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

async function handleMultipleFiles(req, files, programCode) {
  try {
    let documentlist = await getDocumentList(programCode);

    console.log(programCode);

    if (!documentlist) {
      throw new ErrorHandler(NOT_FOUND, "Program code not found.");
    }

    const documents = documentlist.map((document) => document.type);

    const uploadedFiles = [];

    const keys = Object.keys(files);

    let matchingKeys = true;

    await Promise.all(
      keys.map(async (key) => {
        if (!documents.includes(key)) {
          console.log("Key not found");
          matchingKeys = false;
        } else {
          documentlist = documentlist.filter(
            (document) => document.type === key
          );
        }
      })
    );

    if (!matchingKeys) {
      return uploadedFiles;
    }

    documentlist = documentlist[0];

    if (keys.includes(documentlist.type)) {
      await Promise.all(
        await files[documentlist.type].map(async (file) => {
          if (!documentlist.allowed_mimetypes.includes(file.mimetype)) {
            throw new ErrorHandler(
              BAD_GATEWAY,
              `File type ${path.extname(
                file.originalFilename
              )} not allowed for ${documentlist.type}`
            );
          } else if (file.size > documentlist.max_size_in_mb * 1024 * 1024) {
            throw new ErrorHandler(
              BAD_GATEWAY,
              `File ${file.originalFilename} exceeds the allowed size limit of ${documentlist.max_size_in_mb} MB`
            );
          } else {
            const fileDesc = {};

            const parameter = {
              document: file,
            };
            const { name, path, url, mimeType, size } = await randomUpload(
              req,
              parameter,
              "document"
            );
            const insertFile = await sequelize.query(
              `insert into uploaded_documents (document_type_id ,file_name, file_path, file_url, mime_type,file_size_in_mb, created_by, updated_by, created_at, updated_at)
                values (?, ?, ?, ?, ?, ?, ?, ?,  NOW(), NOW())`,
              {
                replacements: [
                  documentlist.id,
                  name,
                  path,
                  url,
                  mimeType,
                  size,
                  req.user.userId,
                  req.user.userId,
                ],
                type: sequelize.QueryTypes.INSERT,
              }
            );
            fileDesc["id"] = insertFile[0];
            fileDesc["fileName"] = name;
            fileDesc[documentlist.type] = url;
            fileDesc["mimeType"] = mimeType;
            fileDesc["fileSizeInMb"] = String(size);
            uploadedFiles.push(fileDesc);
          }
        })
      );
    }
    return uploadedFiles;
  } catch (error) {
    if (error.statusCode) {
      console.log(error.message);
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}
module.exports = {
  fileUpload,
};
