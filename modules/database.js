pgPromise = require("pg-promise")();
//buildUserMessagesObject = require("../../modules/userMessages.js");

const config = {
  host: "localhost",
  port: 5432,
  database: "chatApp",
  user: "matthewvolny",
  password: "Ronweasley1@@@",
};

const database = pgPromise(config);

module.exports = database;
