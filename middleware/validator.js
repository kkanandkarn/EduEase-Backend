const Joi = require("joi");
const { ErrorHandler } = require("../helper");
const { statusCodes } = require("../helper");

const { BAD_GATEWAY } = statusCodes;

const schemas = {
  auth_login_post: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } }) // Validate email format
      .required()
      .messages({
        "string.empty": "Email is required.",
        "string.email": "Invalid email format.",
        "any.required": "Email is required.",
      }),
    password: Joi.string()
      .min(6) // Set minimum password length
      .max(128) // Set maximum password length
      .required()
      .messages({
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters long.",
        "string.max": "Password must be less than 128 characters long.",
        "any.required": "Password is required.",
      }),
  }),
};

const validator = (req, res, next) => {
  console.log(req.path);
  try {
    const key = `${req.path
      .split("/")
      .splice(2)
      .join("_")
      .split("-")
      .join("_")}_${req.method.toLowerCase()}`;

    const schema = schemas[key];
    console.log({ key: key });
    if (!schema) {
      return next();
    } else {
      const { value, error } = schema.validate(req.body);
      if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);
      else next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = validator;
