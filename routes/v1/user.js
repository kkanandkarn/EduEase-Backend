const express = require("express");
const { dispatcher } = require("../../middleware");
const { user } = require("../../controller/v1");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();
const { USER } = PERMISSIONS;

router.post("/add-user", (req, res, next) =>
  dispatcher(req, res, next, user.createUserController, USER.CREATE)
);
router.post("/view-users", (req, res, next) =>
  dispatcher(req, res, next, user.viewUsersController, USER.VIEW)
);
router.post("/view-user-by-id", (req, res, next) =>
  dispatcher(req, res, next, user.viewUserByIdController, USER.VIEW)
);
router.put("/update-user", (req, res, next) =>
  dispatcher(req, res, next, user.updateUserController, USER.UPDATE)
);
router.post("/delete-user", (req, res, next) =>
  dispatcher(req, res, next, user.deleteUserController, USER.DELETE)
);

module.exports = router;
