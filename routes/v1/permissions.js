const express = require("express");
const { dispatcher } = require("../../middleware");
const { permisisons } = require("../../controller/v1");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();

router.post("/add-tenant-permissions", (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    permisisons.addTenantPermissionsController,
    PERMISSIONS.TENANT.ASSIGN_PERMISSION
  )
);
router.get("/global-permissions", (req, res, next) =>
  dispatcher(req, res, next, permisisons.viewGLobalPermissionsController)
);

module.exports = router;
