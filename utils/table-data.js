const PagiHelp = require("pagi-help");
const { ErrorHandler } = require("../helper");
const { SERVER_ERROR } = require("../helper/status-codes");
const { transactionFunction } = require("../helper/transaction");
const { SERVER_ERROR_MSG } = require("./constant");
const sequelize = require("../config/db");

const getTableData = async (req, programCode) => {
  try {
    const { tableHeaders, tableName, tableColumnList, tableSearchColumnList } =
      await tableConditions(programCode);

    const { additionalWhereConditions, joinQuery } = await additionalQuery(
      programCode
    );

    let paginationArr = [];
    let toPush = {
      tableName: tableName,
      columnList: tableColumnList,
      searchColumnList: tableSearchColumnList,
      additionalWhereConditions: additionalWhereConditions,
      joinQuery: joinQuery,
    };

    paginationArr.push(toPush);

    let genPaginate = new PagiHelp({
      columnNameConverter: (x) =>
        x.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
    });

    let paginationQueries = genPaginate.paginate(req.body, paginationArr);

    let totalCount = await sequelize.query(paginationQueries.countQuery, {
      replacements: paginationQueries.replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    let data = await sequelize.query(paginationQueries.query, {
      replacements: paginationQueries.replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    return { headers: tableHeaders, data: data, totalCount: totalCount.length };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

async function tableConditions(programCode) {
  try {
    const replacements = { programCode: programCode };
    const tableHeaders = await transactionFunction(
      "GET-TABLE-HEADER",
      replacements
    );
    const tableProgramCode = await transactionFunction(
      "GET-TABLE-NAME",
      replacements
    );

    const tableName = tableProgramCode[0].table_name;

    const tableColumnList = await transactionFunction(
      "GET-TABLE-COLUMN-LIST",
      replacements
    );
    const tableSearchColumnList = await transactionFunction(
      "GET-TABLE-SEARCH-COLUMN-LIST",
      replacements
    );
    return {
      tableHeaders,
      tableName,
      tableColumnList,
      tableSearchColumnList,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

async function additionalQuery(programCode) {
  try {
    const replacements = { programCode: programCode };
    const additionalWhereConditions = [];

    const whereConditions = await transactionFunction(
      "ADDITIONAL_QUERY",
      replacements
    );

    await Promise.all(
      whereConditions.map((whereCondition) => {
        const query = [];
        if (whereCondition.operator === "IN") {
          const condition = JSON.parse(whereCondition.condition);
          query.push(whereCondition.column, whereCondition.operator, condition);
        } else {
          query.push(
            whereCondition.column,
            whereCondition.operator,
            whereCondition.condition
          );
        }

        additionalWhereConditions.push(query);
      })
    );

    const additionalQuery = [];
    const joinQuery = await transactionFunction("JOIN_QUERY", replacements);

    joinQuery.map((query) => additionalQuery.push(query.column));

    const joinquery = additionalQuery.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      ""
    );

    return {
      additionalWhereConditions: additionalWhereConditions,
      joinQuery: joinquery,
    };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}
module.exports = { getTableData };
