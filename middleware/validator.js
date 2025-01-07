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
  tenant_view_tenant_by_id_post: Joi.object({
    tenantId: Joi.number().integer().positive().required().messages({
      "number.base": "id must be a number",
      "number.positive": "id be a positive number",
      "any.required": "id is required",
    }),
  }),
  permissions_add_tenant_permissions_post: Joi.object({
    tenantId: Joi.number().integer().positive().required().messages({
      "number.base": "Tenant ID must be a number.",
      "number.integer": "Tenant ID must be an integer.",
      "number.positive": "Tenant ID must be a positive number.",
      "any.required": "Tenant ID is required.",
    }),
    permissions: Joi.array()
      .items(
        Joi.number().integer().positive().messages({
          "number.base": "Each permission must be a number.",
          "number.integer": "Each permission must be an integer.",
          "number.positive": "Each permission must be a positive number.",
        })
      )
      .required()
      .messages({
        "array.base": "Permissions must be an array.",
        "any.required": "Permissions are required.",
      }),
  }),
  role_create_role_post: Joi.object({
    tenantId: Joi.number().integer().positive().optional().messages({
      "number.base": "Tenant ID must be a number.",
      "number.integer": "Tenant ID must be an integer.",
      "number.positive": "Tenant ID must be a positive number.",
    }),
    role: Joi.object({
      roleName: Joi.string().trim().required().messages({
        "string.base": "Role Name must be a string",
        "any.required": "Role Name is required",
        "string.empty": "Role Name cannot be empty",
      }),
      permissions: Joi.array()
        .items(
          Joi.number().integer().messages({
            "number.base": "Each permission must be a number",
            "number.integer": "Each permission must be an integer",
          })
        )
        .required()
        .messages({
          "array.base": "permissions must be an array",
          "any.required": "permissions is required",
        }),
    }),
  }),
  role_view_role_by_id_post: Joi.object({
    roleId: Joi.number().integer().required().messages({
      "number.base": "id must be a number",
      "number.integer": "id must be an integer",
      "any.required": "id is required",
    }),
    tenantId: Joi.number().integer().positive().optional().messages({
      "number.base": "Tenant ID must be a number.",
      "number.integer": "Tenant ID must be an integer.",
      "number.positive": "Tenant ID must be a positive number.",
    }),
  }),
  role_update_role_put: Joi.object({
    tenantId: Joi.number().integer().positive().optional().messages({
      "number.base": "Tenant ID must be a number.",
      "number.integer": "Tenant ID must be an integer.",
      "number.positive": "Tenant ID must be a positive number.",
    }),
    role: Joi.object({
      roleId: Joi.number().integer().required().messages({
        "number.base": "role id must be a number",
        "number.integer": "role id must be an integer",
        "any.required": "role id is required",
      }),
      roleName: Joi.string().trim().required().messages({
        "string.base": "Role Name must be a string",
        "any.required": "Role Name is required",
        "string.empty": "Role Name cannot be empty",
      }),
      permissions: Joi.array()
        .items(
          Joi.number().integer().messages({
            "number.base": "Each permission must be a number",
            "number.integer": "Each permission must be an integer",
          })
        )
        .required()
        .messages({
          "array.base": "permissions must be an array",
          "any.required": "permissions is required",
        }),
      status: Joi.string()
        .trim()
        .valid("Active", "Hold", "Suspended")
        .required()
        .messages({
          "any.only": "Invalid status.",
          "string.empty": "Status is required",
          "any.required": "Status is required",
        }),
    })

      .required()
      .messages({
        "array.base": "roles must be an array",
        "any.required": "roles is required",
      }),
  }),
  tenant_permissions_post: Joi.object({
    tenantId: Joi.number().integer().optional().messages({
      "number.base": "tenantId must be a number",
      "number.integer": "tenantId must be an integer",
    }),
  }),
  role_permissions_post: Joi.object({
    roleId: Joi.number().integer().required().messages({
      "number.base": "roleId must be a number",
      "number.integer": "roleId must be a number",
      "any.required": "roleId is required",
    }),
  }),
  user_view_user_by_id_post: Joi.object({
    userId: Joi.number().integer().required().messages({
      "number.base": "user id must be a number",
      "number.integer": "user is must be a number",
      "any.required": "user id is required",
    }),
    tenantId: Joi.number().integer().optional().allow(null).allow("").messages({
      "number.base": "tenantId must be a number",
      "number.integer": "tenantId must be an integer",
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
