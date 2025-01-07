const fs = require("fs");
const path = require("path");
const sequelize = require("../../../config/db");
const { generateUniqueId } = require("./upload-to-cloud");

async function moveUploadedFile(uploadedFile, tenantId, transaction) {
  try {
    const baseUploadPath = process.env.FILE_UPLOAD_PATH;

    // Source file path
    const sourceFilePath = path.join(baseUploadPath, uploadedFile.filePath);

    // Target directory path
    const targetDirectory = path.join(baseUploadPath, tenantId.toString());

    // Ensure the target directory exists
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }

    const uniqueId = await generateUniqueId();

    let newFileName = uniqueId + path.extname(uploadedFile.fileName);

    // Target file path
    const targetFilePath = path.join(targetDirectory, newFileName);

    // Copy the file to the new location
    fs.copyFileSync(sourceFilePath, targetFilePath);

    // Unlink (delete) the original file
    fs.unlinkSync(sourceFilePath);

    const newFilePath = `uploads/${tenantId}/${newFileName}`;
    const newFileUrl = `${process.env.BACKEND_URL}/${newFilePath}`;

    const replacements = {
      replacements: [newFilePath, newFileUrl, uploadedFile.id],
      type: sequelize.QueryTypes.UPDATE,
    };
    if (transaction) {
      replacements.transaction = transaction;
    }

    await sequelize.query(
      `update uploaded_documents set file_path = ?, file_url = ? where id = ?`,
      replacements
    );

    console.log(`File moved to: ${targetFilePath}`);
    return targetFilePath; // Return the new file path if needed
  } catch (error) {
    console.error("Error moving file:", error);
    throw new Error("Failed to move uploaded file.");
  }
}
module.exports = { moveUploadedFile };
