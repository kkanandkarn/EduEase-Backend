const { role } = require("../../../services/v1");

const createRoleController = async (req, res, next) => {
  try {
    const resposne = await role.createRole(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
const viewRoleController = async (req, res, next) => {
  try {
    const resposne = await role.viewRoles(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
const viewRoleByIdController = async (req, res, next) => {
  try {
    const resposne = await role.viewRoleById(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};

const updateRoleController = async (req, res, next) => {
  try {
    const resposne = await role.updateRole(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
const deleteRoleController = async (req, res, next) => {
  try {
    const resposne = await role.deleteRole(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
const getRolePermissionsController = async (req, res, next) => {
  try {
    const resposne = await role.getRolePermissions(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createRoleController,
  viewRoleController,
  viewRoleByIdController,
  updateRoleController,
  deleteRoleController,
  getRolePermissionsController,
};
