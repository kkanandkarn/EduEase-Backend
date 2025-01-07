const sequelize = require("../../../config/db");
const { ErrorHandler } = require("../../../helper");
const {
  BAD_GATEWAY,
  SERVER_ERROR,
  NOT_FOUND,
} = require("../../../helper/status-codes");
const { SERVER_ERROR_MSG } = require("../../../utils/constant");

const dropdown = async (req) => {
  try {
    const { dropdownCode, replacements = [] } = req.body;

    if (!dropdownCode) {
      throw new ErrorHandler(BAD_GATEWAY, "Dropdown code is required.");
    }
    const dropdownQuery = await checkDropdownCode(dropdownCode);

    const query = await queryBuilder(dropdownQuery, replacements);

    const dropdownData = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    if (!dropdownData.length) {
      return [];
    }

    return dropdownData;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

async function checkDropdownCode(dropdownCode) {
  try {
    const dropdownQuery = await sequelize.query(
      `select * from dropdown_query where status='Active' and dropdown_code=?`,
      {
        replacements: [dropdownCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (!dropdownQuery.length) {
      throw new ErrorHandler(NOT_FOUND, "Dropdown code not found");
    }
    return dropdownQuery;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}
async function queryBuilder(dropdownQuery, replacements) {
  try {
    let query = "";
    query += dropdownQuery[0].query;
    if (dropdownQuery[0].conditions) {
      if (!replacements.length) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          "This dropdown code needs replacements"
        );
      }
      let findVal;
      try {
        findVal = dropdownQuery[0].conditions.match(/\?/g) || [];
      } catch (e) {
        findVal = [];
      }
      if (replacements.length !== findVal.length) {
        throw new ErrorHandler(
          BAD_GATEWAY,
          `replacements array length must be ${findVal.length}`
        );
      }
      query += ` where status='Active' and ${dropdownQuery[0].conditions}`;
    }
    if (!dropdownQuery[0].conditions) {
      query += ` where status='Active'`;
    }
    if (dropdownQuery[0].order_by) {
      query += ` order by ${dropdownQuery[0].order_by}`;
    }
    return query;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

module.exports = {
  dropdown,
};
