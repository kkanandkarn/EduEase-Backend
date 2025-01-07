const { user } = require("../../../services/v1");

const createUserController = async (req, res, next) => {
  try {
    const response = await user.createUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewUsersController = async (req, res, next) => {
  try {
    const response = await user.viewUsers(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewUserByIdController = async (req, res, next) => {
  try {
    const response = await user.viewUserById(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const updateUserController = async (req, res, next) => {
  try {
    const response = await user.updateUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const deleteUserController = async (req, res, next) => {
  try {
    const response = await user.deleteUser(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUserController,
  viewUsersController,
  viewUserByIdController,
  updateUserController,
  deleteUserController,
};
