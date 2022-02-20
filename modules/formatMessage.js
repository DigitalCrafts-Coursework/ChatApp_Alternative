const moment = require("moment");

//converts typed messages to objects containing the username, textcontent, and date/time
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

module.exports = formatMessage;
