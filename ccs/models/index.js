const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
const db = {};
db.mongoose = mongoose;

(async () => {
  try {
    console.log(dbConfig.URL);
    await db.mongoose.connect(dbConfig.URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbConfig.DB,
    });
  } catch (error) {
    console.log("cannot connect to database", error);
    process.exit;
  }
})();

db.users = require("./users.model.js")(mongoose);
db.files = require("./files.model.js")(mongoose);

module.exports = db;
