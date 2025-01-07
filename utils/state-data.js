const xlsx = require("xlsx");
const path = require("path");
const sequelize = require("../config/db");

// Function to read Excel file and remove duplicate state names from column B
async function getUniqueStateNames(filePath) {
  // Read the Excel file
  const workbook = xlsx.readFile(filePath);

  // Assuming the data is in the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert the sheet to JSON format
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // Create a map to store state and its districts
  const stateDistrictMap = {};

  // Iterate through the rows, starting from the second row (index 1) to skip the header
  data.forEach((row, index) => {
    if (index > 0) {
      const state = row[1]; // State name in column B (index 1)
      const district = row[3]; // District name in column D (index 3)

      if (state && district) {
        if (!stateDistrictMap[state]) {
          stateDistrictMap[state] = new Set();
        }
        stateDistrictMap[state].add(district);
      }
    }
  });

  // Convert the map to the desired format
  const result = Object.entries(stateDistrictMap).map(([state, districts]) => ({
    state,
    districts: Array.from(districts),
  }));

  await Promise.all(
    result.map(async (state) => {
      const [stateId, _] = await sequelize.query(
        `
  insert into state (state, created_at, updated_at) values (?, NOW(), NOW())`,
        {
          replacements: [state.state],
          type: sequelize.QueryTypes.INSERT,
        }
      );
      state.districts.map(async (district) => {
        sequelize.query(
          `
      insert into district (district, state, created_at, updated_at) values (?, ?, NOW(), NOW())`,
          {
            replacements: [district, stateId],
            type: sequelize.QueryTypes.INSERT,
          }
        );
      });
    })
  );

  return result;
}

module.exports = {
  getUniqueStateNames,
};
