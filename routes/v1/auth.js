const express = require("express");
const { dispatcher } = require("../../middleware");
const router = express.Router();
const { auth } = require("../../controller/v1");

router.post("/login", (req, res, next) =>
  dispatcher(req, res, next, auth.loginController)
);

module.exports = router;
