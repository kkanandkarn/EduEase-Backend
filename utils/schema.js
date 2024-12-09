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
  }),
  tenant_update_tenant_post: Joi.object({
    id: Joi.number().integer().positive().required().messages({
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
    status: Joi.string()
      .valid("Active", "Hold", "Suspended")
      .required()
      .messages({
        "any.only": "Invalid status.",
        "string.empty": "Status is required",
        "any.required": "Status is required",
      }),
  }),
};
module.exports = schema;
