const express = require("express");
const { dispatcher } = require("../../middleware");
const { tenant } = require("../../controller/v1");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();

router.post("/create-tenant", (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    tenant.createTenantController,
    PERMISSIONS.TENANT.CREATE
  )
);
router.post("/view-tenants", (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    tenant.viewTenantsController,
    PERMISSIONS.TENANT.VIEW
  )
);
router.post("/view-tenant-by-id", (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    tenant.viewTenantByIdController,
    PERMISSIONS.TENANT.VIEW
  )
);
router.put("/update-tenant", (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    tenant.updateTenantController,
    PERMISSIONS.TENANT.UPDATE
  )
);

module.exports = router;
