const db = require("../models");
const File = db.files;

// ? find all files uploaded by logged user
exports.findAll = async (req, res) => {
  try {
    let files = await File.find({ userId: req.loggedUser.id }).exec();
    res.status(200).json({ success: true, files: files });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

// ? add one
exports.addOne = async (req, res) => {
  try {
    let today = new Date();

    let date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear() +
      " " +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds();

    let file = await File.create({
      name: req.body.name,
      path: req.body.path,
      userId: req.loggedUser.id,
      dateAdded: date,
      dateLastEdited: date,
    });
    return res.status(201).json({
      success: true,
      msg: "File was added successfully!",
      file: file,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred.",
    });
  }
};
