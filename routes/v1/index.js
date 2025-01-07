const express = require("express");
const app = express();
const auth = require("./auth");
const tenant = require("./tenant");
const permissions = require("./permissions");
const role = require("./role");
const user = require("./user");
const dropdown = require("./dropdown");

app.use("/auth", auth);
app.use("/tenant", tenant);
app.use("/permissions", permissions);
app.use("/role", role);
app.use("/user", user);
app.use("/dropdown", dropdown);

app.use((req, res, next) => {
  const error = new Error("Invalid API. Make sure to call the correct API.");
  error.status = 404;
  next(error);
});

module.exports = app;
