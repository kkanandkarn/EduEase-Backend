const sequelize = require("../../../config/db");
const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  CONFLICT,
  NOT_FOUND,
} = require("../../../helper/status-codes");
const { transactionFunction } = require("../../../helper/transaction");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");
const { hashPassword } = require("../../../utils/hash");
const schemas = require("../../../utils/schema");
const { getTableData } = require("../../../utils/table-data");
const { fileUpload } = require("../file-upload/file-uploads");
const { moveUploadedFile } = require("../file-upload/move-uplaod-file");
const { formidableUpload } = require("../file-upload/upload-to-cloud");

const createUser = async (req) => {
  const transaction = await sequelize.transaction();
  try {
    const { files, fields } = await formidableUpload(req);
    const userId = req.user.userId;

    const schema = schemas["user_create_user_post"];
    const { error } = schema.validate(fields);
    if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);

    const checkEmail = await transactionFunction(
      "GET-USER-BY-EMAIL",
      fields,
      transaction
    );
    if (checkEmail.length) {
      throw new ErrorHandler(CONFLICT, "Email already exists");
    }

    fields.password = await hashPassword(fields.password);
    fields.tenantId = fields.tenantId || req.user.tenant;

    const checkRole = await transactionFunction(
      "GET-ROLE-BY-ID",
      fields,
      transaction
    );
    if (!checkRole.length) {
      throw new ErrorHandler(BAD_GATEWAY, "Invalid choice of role");
    }

    const { uploadedFile } = await fileUpload(req, files, "USER_DETAILS");
    fields.userImage = uploadedFile.length ? uploadedFile[0].id : null;

    fields.createdBy = userId;
    fields.updatedBy = userId;

    const [user, _] = await transactionFunction(
      "INSERT-USER",
      fields,
      transaction
    );

    const [tenant] = await transactionFunction(
      "GET-TENANT-BY-ID",
      fields,
      transaction
    );

    const userCount = parseInt(tenant.user_count) + 1;
    await transactionFunction(
      "UPDATE-TENANT-USER-COUNT",
      { userCount: userCount, tenantId: fields.tenantId },
      transaction
    );

    if (uploadedFile.length) {
      await moveUploadedFile(uploadedFile[0], fields.tenantId, transaction);
    }

    await transaction.commit();
    return { message: "User added successfully", userId: user };
  } catch (error) {
    await transaction.rollback();
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const viewUsers = async (req) => {
  try {
    const tenantId = req.body.tenantId || req.user.tenant;

    const { headers, data, totalCount } = await getTableData(
      req,
      "TENANT_USERS",
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

const viewUserById = async (req) => {
  try {
    if (!req.body.tenantId) {
      req.body.tenantId = req.user.tenant;
    }
    let [user] = await transactionFunction("GET-USER-BY-ID", req.body);
    if (!user) {
      throw new ErrorHandler(NOT_FOUND, "User not found.");
    }
    const keysToRemove = ["password"];

    user = Object.fromEntries(
      Object.entries(user).filter(([key]) => !keysToRemove.includes(key))
    );

    return user;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const updateUser = async (req) => {
  const transaction = await sequelize.transaction();
  try {
    const { files, fields } = await formidableUpload(req);
    const userId = req.user.userId;
    fields.tenantId = fields.tenantId || req.user.tenant;

    const schema = schemas["user_update_user_post"];
    const { error } = schema.validate(fields);
    if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);

    const [user] = await transactionFunction(
      "GET-USER-BY-ID",
      fields,
      transaction
    );
    if (!user) {
      throw new ErrorHandler(NOT_FOUND, "User not found");
    }

    const checkEmail = await transactionFunction(
      "GET-USER-BY-EMAIL",
      fields,
      transaction
    );
    if (fields.email !== user.email && checkEmail.length) {
      throw new ErrorHandler(CONFLICT, "Email already exists");
    }
    if (fields.password && fields.password.trim() !== "") {
      fields.password = await hashPassword(fields.password);
    } else {
      fields.password = user.password;
    }

    const checkRole = await transactionFunction(
      "GET-ROLE-BY-ID",
      fields,
      transaction
    );
    if (!checkRole.length) {
      throw new ErrorHandler(BAD_GATEWAY, "Invalid choice of role");
    }

    const { uploadedFile } = await fileUpload(req, files, "USER_DETAILS");
    fields.userImage = uploadedFile.length
      ? uploadedFile[0].id
      : user?.user_image?.file_id;

    fields.updatedBy = userId;

    await transactionFunction("UPDATE-USER", fields, transaction);

    if (uploadedFile.length) {
      await moveUploadedFile(uploadedFile[0], fields.tenantId, transaction);
    }

    await transaction.commit();
    return { message: "User updated successfully" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const deleteUser = async (req) => {
  try {
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

module.exports = {
  createUser,
  viewUsers,
  viewUserById,
  updateUser,
  deleteUser,
};
