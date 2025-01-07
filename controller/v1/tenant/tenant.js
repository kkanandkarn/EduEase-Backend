const { tenant, auth } = require("../../../services/v1");

const createTenantController = async (req, res, next) => {
  try {
    const response = await tenant.createTenant(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewTenantsController = async (req, res, next) => {
  try {
    const response = await tenant.viewTenants(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewTenantByIdController = async (req, res, next) => {
  try {
    const response = await tenant.viewTenantById(req);
    return response;
  } catch (error) {
    next(error);
  }
};

const updateTenantController = async (req, res, next) => {
  try {
    const response = await tenant.updateTenant(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const getTenantPermisisonsController = async (req, res, next) => {
  try {
    const response = await tenant.getTenantPermisisons(req);
    return response;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createTenantController,
  viewTenantsController,
  viewTenantByIdController,
  updateTenantController,
  getTenantPermisisonsController,
};
