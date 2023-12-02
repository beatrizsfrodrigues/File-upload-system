const db = require("../models");
const User = db.users;

// * find all users
exports.findAll = async (req, res) => {
  try {
    let users = await User.findAll;
    res.status(200).json({ success: true, users: users });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};
