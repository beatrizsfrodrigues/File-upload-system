const db = require("../models");
const Logbook = db.logbooks;

// * find all files
exports.findAll = async (req, res) => {
  try {
    let logbooks = await Logbook.findAll().exec();
    res.status(200).json({ success: true, logbooks: logbooks });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};
