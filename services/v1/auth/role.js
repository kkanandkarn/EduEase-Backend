const { ErrorHandler } = require("../../../helper");
const { SERVER_ERROR } = require("../../../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");

const createRole = async (role) => {
  try {
    const { role } = req.body;

    return { message: "Tenant created successfully", tenants: tenants };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
