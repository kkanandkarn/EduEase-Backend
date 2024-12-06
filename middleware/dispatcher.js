const {
  statusCodes,
  authHelper,
  ErrorHandler,
  casbinEnforcer,
} = require("../helper");
const { constant, camelize } = require("../utils");

const { OK, UNAUTHORIZED } = statusCodes;
const { SUCCESS, FAILURE } = constant;

/**
 *
 * The dispacter function middleware is the single source for sending the response. This middleware
 * checks if the user is authenticated and if the allowed user has access to the controller.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @param {*} func -> Router controller function
 * @param resource -> Resource to Check Permission On
 * @param {*} perm -> Permission to Check
 * @returns -> The final response with the data
 */

const dispatcher = async (req, res, next, func, perm) => {
  try {
    const { user } = req;

    if (perm) {
      const checkPerm = await matchPermission(req, user.role, perm);

      if (!checkPerm) throw new ErrorHandler(UNAUTHORIZED, "Not permitted");
    }
    const data = await func(req, res, next);

    if (data != null) {
      const camelData = await camelize(data);
      return res
        .status(OK)
        .json({ status: SUCCESS, statusCode: 200, data: camelData });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = dispatcher;
