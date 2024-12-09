const { auth } = require("../../../services/v1");

const loginController = async (req, res, next) => {
  try {
    const response = await auth.login(req);
    return response;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  loginController,
};
