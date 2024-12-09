const express = require("express");
const app = express();
const auth = require("./auth");
const tenant = require("./tenant");

app.use("/auth", auth);
app.use("/tenant", tenant);

app.use((req, res, next) => {
  const error = new Error("Invalid API. Make sure to call the correct API.");
  error.status = 404;
  next(error);
});

module.exports = app;
