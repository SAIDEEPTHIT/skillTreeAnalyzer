const { Database } = require('arangojs');

const db = new Database({
  url: "http://127.0.0.1:8529",
  databaseName: "skilltree",
  auth: { username: "root", password: "root" }
});

module.exports = db;
