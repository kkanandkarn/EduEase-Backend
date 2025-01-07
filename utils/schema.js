const Joi = require("joi");

const schema = {
  tenant_create_tenant_post: Joi.object({
    tenantName: Joi.string().trim().required().messages({
      "string.empty": "Name is required",
      "any.required": "Name is required.",
    }),
    tenantEmail: Joi.string()
      .trim()
      .email({ tlds: { allow: false } }) // Validate email format
      .required()
      .messages({
        "string.empty": "Email is required.",
        "string.email": "Invalid email format.",
        "any.required": "Email is required.",
      }),
    tenantContact: Joi.string()
      .trim()
      .length(10)
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.length": "Contact must be exactly 10 digits",
        "string.pattern.base": "Invalid Contact",
        "any.required": "Contact is required",
      }),
    tenantAddress: Joi.string().trim().required().messages({
      "string.empty": "Address is required",
      "any.required": "Address is required.",
    }),
    tenantPermissions: Joi.array().items(Joi.number()).required().messages({
      "array.base": "Permissions must be an array.",
      "any.required": "Permissions are required.",
    }),
  }),
  tenant_update_tenant_post: Joi.object({
    tenantId: Joi.number().integer().positive().required().messages({
      "number.base": "id must be a number",
      "number.positive": "id be a positive number",
      "any.required": "id is required",
    }),
    tenantName: Joi.string().trim().required().messages({
      "string.empty": "Name is required",
      "any.required": "Name is required.",
    }),
    tenantEmail: Joi.string()
      .trim()
      .email({ tlds: { allow: false } }) // Validate email format
      .required()
      .messages({
        "string.empty": "Email is required.",
        "string.email": "Invalid email format.",
        "any.required": "Email is required.",
      }),
    tenantContact: Joi.string()
      .trim()
      .length(10)
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.length": "Contact must be exactly 10 digits",
        "string.pattern.base": "Invalid Contact",
        "any.required": "Contact is required",
      }),
    tenantAddress: Joi.string().trim().required().messages({
      "string.empty": "Address is required",
      "any.required": "Address is required.",
    }),
    tenantPermissions: Joi.array().items(Joi.number()).required().messages({
      "array.base": "Permissions must be an array.",
      "any.required": "Permissions are required.",
    }),
    status: Joi.string()
      .valid("Active", "Hold", "Suspended")
      .required()
      .messages({
        "any.only": "Invalid status.",
        "string.empty": "Status is required",
        "any.required": "Status is required",
      }),
    tenantLogo: Joi.allow(null).allow(""),
  }),
  user_create_user_post: Joi.object({
    tenantId: Joi.number().integer().positive().optional().messages({
      "number.base": "Tenant ID must be a number.",
      "number.integer": "Tenant ID must be an integer.",
      "number.positive": "Tenant ID must be a positive number.",
    }),
    name: Joi.string().trim().required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is not allowed to be empty",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().trim().required().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is not allowed to be empty",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
      )
      .required()
      .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is not allowed to be empty",
        "string.pattern.base":
          "Password must be 8-20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),
    contact: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        "string.base": "Contact must be a string",
        "string.empty": "Contact is not allowed to be empty",
        "string.pattern.base": "Contact must be a valid 10-digit number",
      }),
    address: Joi.string().trim().optional().messages({
      "string.base": "Address must be a string",
      "string.empty": "Address is not allowed to be empty",
      "any.required": "Address is required",
    }),
    roleId: Joi.number().integer().positive().required().messages({
      "number.base": "Role ID must be a number",
      "number.integer": "Role ID must be an integer",
      "number.positive": "Role ID must be a positive number",
      "any.required": "Role ID is required",
    }),
    userImage: Joi.string().optional().allow(null),
  }),
  user_update_user_post: Joi.object({
    userId: Joi.number().integer().positive().required().messages({
      "number.base": "User ID must be a number.",
      "number.integer": "User ID must be an integer.",
      "number.positive": "User ID must be a positive number.",
      "any.required": "User Id is required",
    }),
    tenantId: Joi.number()
      .integer()
      .positive()
      .optional()
      .allow(null)
      .messages({
        "number.base": "Tenant ID must be a number.",
        "number.integer": "Tenant ID must be an integer.",
        "number.positive": "Tenant ID must be a positive number.",
      }),
    name: Joi.string().trim().required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is not allowed to be empty",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().trim().required().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is not allowed to be empty",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
      )
      .optional()
      .allow("")
      .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is not allowed to be empty",
        "string.pattern.base":
          "Password must be 8-20 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    contact: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        "string.base": "Contact must be a string",
        "string.empty": "Contact is not allowed to be empty",
        "string.pattern.base": "Contact must be a valid 10-digit number",
      }),
    address: Joi.string().trim().optional().messages({
      "string.base": "Address must be a string",
      "string.empty": "Address is not allowed to be empty",
      "any.required": "Address is required",
    }),
    roleId: Joi.number().integer().positive().required().messages({
      "number.base": "Role ID must be a number",
      "number.integer": "Role ID must be an integer",
      "number.positive": "Role ID must be a positive number",
      "any.required": "Role ID is required",
    }),
    userImage: Joi.string().optional().allow(null),
    status: Joi.string()
      .trim()
      .valid("Active", "Hold", "Suspended")
      .required()
      .messages({
        "string.base": "Status must be a string.",
        "string.empty": "Status is not allowed to be empty",
        "any.only": "Status must be one of Active, Hold, or Suspended.",
        "any.required": "Status is required.",
      }),
  }),
};
module.exports = schema;
