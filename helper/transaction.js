const sequelize = require("../config/db");
const { SERVER_ERROR_MSG } = require("../utils/constant");
const { formatTime } = require("../utils/format-time");
const { ErrorHandler } = require("./error-handler");
const { SERVER_ERROR } = require("./status-codes");

const transactionFunction = async (
  programCode,
  body = {},
  transaction = null
) => {
  try {
    const replacements = [];
    const types = {
      SELECT: sequelize.QueryTypes.SELECT,
      INSERT: sequelize.QueryTypes.INSERT,
      UPDATE: sequelize.QueryTypes.UPDATE,
      DELETE: sequelize.QueryTypes.DELETE,
    };
    const sysQueryObj = {
      replacements: [programCode],
      type: sequelize.QueryTypes.SELECT,
    };
    if (transaction) {
      sysQueryObj.transaction = transaction;
    }

    const [sysQuery] = await sequelize.query(
      `select query, replacement_keys, query_type from sys_query where program_code = ? and status != "Deleted"`,
      sysQueryObj
    );
    if (!sysQuery) {
      console.log("Invalid sys code");
      throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
    }
    const requiredReplacements = sysQuery.replacement_keys;
    if (requiredReplacements.length) {
      for (let i in requiredReplacements) {
        const key = requiredReplacements[i];
        if (key in body) {
          replacements.push(body[key]);
        } else {
          replacements.push(null);
        }
      }
    }

    const queryObj = {
      replacements: replacements,
      type: types[sysQuery.query_type],
    };
    if (transaction) {
      queryObj.transaction = transaction;
    }

    const query = sysQuery.query;
    let data = await sequelize.query(query, queryObj);
    if (queryObj.type === "SELECT") {
      data = await formatTime(data);
    }

    return data;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  transactionFunction,
};
