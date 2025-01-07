const { viewGLobalPermissions } = require("./permissions");
const {
  createTenant,
  viewTenants,
  viewTenantById,
  updateTenant,
  getTenantPermisisons,
} = require("./tenant");

module.exports = {
  createTenant,
  viewTenants,
  viewTenantById,
  updateTenant,
  viewGLobalPermissions,
  getTenantPermisisons,
};
