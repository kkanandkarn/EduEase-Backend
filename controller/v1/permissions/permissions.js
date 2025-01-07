const { ErrorHandler } = require("../../../helper");
const { UNAUTHORIZED } = require("../../../helper/status-codes");
const { transactionFunction } = require("../../../helper/transaction");
const { permisisons, tenant } = require("../../../services/v1");

const addTenantPermissionsController = async (req, res, next) => {
  try {
    const resposne = await permisisons.addTenantPermissions(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
const viewGLobalPermissionsController = async (req, res, next) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "UNAUTHORIZED");
    }
    const resposne = await tenant.viewGLobalPermissions(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addTenantPermissionsController,
  viewGLobalPermissionsController,
};
