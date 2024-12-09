const { ErrorHandler } = require("../../../helper");
const { NOT_FOUND, SERVER_ERROR } = require("../../../helper/status-codes");
const { transactionFunction } = require("../../../helper/transaction");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");

const viewUserById = async (req) => {
  try {
    const [user] = await transactionFunction("GET-USER-BY-ID", req.body);
    if (!user) {
      throw new ErrorHandler(NOT_FOUND, "User not found");
    }
    return user;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  viewUserById,
};
