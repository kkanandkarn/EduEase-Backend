const validateToken = require("./auth");
const validator = require("./validator");
const dispatcher = require("./dispatcher");
const handleError = require("./handle-error");
const { morganLogger } = require("./logger");

module.exports = {
  validateToken,
  validator,
  dispatcher,
  handleError,
  morganLogger,
};
