const { tenant } = require("../../../services/v1");

const createTenantController = async (req, res, next) => {
  try {
    const resposne = await tenant.createTenant(req);
    return resposne;
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createTenantController,
};
