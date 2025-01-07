const express = require("express");
const { dispatcher } = require("../../middleware");
const { dropdown } = require("../../controller/v1");
const router = express.Router();

router.post("/dropdown-data", (req, res, next) =>
  dispatcher(req, res, next, dropdown.dropdownController)
);

module.exports = router;
