const jwt = require("jsonwebtoken");

module.exports = function (id, role, tenant) {
  return jwt.sign(
    { userId: id, role: role, tenant: tenant },
    process.env.JWT_PRIVATE_KEY
  );
};
