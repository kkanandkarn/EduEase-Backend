const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
require("moment-timezone")().tz("Asia/Kolkata");
const {
  morganLogger,
  validator,
  validateToken,
  handleError,
} = require("./middleware");

const app = express();

app
  .use(morganLogger)
  .use(cors())
  .use(helmet())
  .use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 50000,
    })
  )
  .use(bodyParser.json({ limit: "100mb" }))
  .use(express.static(path.join(__dirname, "public")));

app.use(validator);
app.use(validateToken);

app.use((err, req, res, next) => {
  handleError(err, res);
});

module.exports = app;
