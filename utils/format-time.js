const moment = require("moment-timezone");

async function formatTime(dataArray) {
  const timeZone = "Asia/Kolkata";

  dataArray = await dataArray.map((item) => {
    if (item.created_at) {
      item.created_at = moment
        .utc(item.created_at)
        .tz(timeZone)
        .format("YYYY-MM-DD hh:mm:ss A");
    }
    return item;
  });

  dataArray = await dataArray.map((item) => {
    if (item.updated_at) {
      item.updated_at = moment
        .utc(item.updated_at)
        .tz(timeZone)
        .format("YYYY-MM-DD hh:mm:ss A");
    }
    return item;
  });

  return dataArray;
}

module.exports = {
  formatTime,
};
