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
    PERMISSIONS.CREATE_TENANT
  )
);

module.exports = router;
