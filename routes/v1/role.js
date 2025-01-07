const express = require("express");
const { dispatcher } = require("../../middleware");
const { role } = require("../../controller/v1");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();
const { ROLE } = PERMISSIONS;

router.post("/create-role", (req, res, next) =>
  dispatcher(req, res, next, role.createRoleController, ROLE.CREATE)
);
router.post("/view-role", (req, res, next) =>
  dispatcher(req, res, next, role.viewRoleController, ROLE.VIEW)
);
router.post("/view-role-by-id", (req, res, next) =>
  dispatcher(req, res, next, role.viewRoleByIdController, ROLE.VIEW)
);
router.put("/update-role", (req, res, next) =>
  dispatcher(req, res, next, role.updateRoleController, ROLE.UPDATE)
);
router.post("/delete-role", (req, res, next) =>
  dispatcher(req, res, next, role.deleteRoleController, ROLE.DELETE)
);
router.post("/permissions", (req, res, next) =>
  dispatcher(req, res, next, role.getRolePermissionsController, ROLE.VIEW)
);

module.exports = router;
