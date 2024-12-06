const jwt = require("jsonwebtoken");
const users = require("../helper/users");

module.exports = function (id, role, tenant) {
  return jwt.sign(
    { userId: id, role: role, tenant: tenant },
    process.env.JWT_PRIVATE_KEY
  );
};
