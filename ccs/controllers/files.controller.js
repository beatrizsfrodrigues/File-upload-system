const db = require("../models");
const File = db.files;

// * find all files
exports.findAll = async (req, res) => {
  try {
    let files = await File.findAll().exec();
    res.status(200).json({ success: true, files: files });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

exports.addOne = async (req, res) => {
  try {
    let today = new Date();
    console.log(today);

    let file = await File.create({
      name: "test name",
      path: "test path",
      userId: "test id",
      dateAdded:
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear() +
        " " +
        today.getHours() +
        ":" +
        today.getMinutes() +
        ":" +
        today.getSeconds(),
      dateLastEdited:
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear() +
        " " +
        today.getHours() +
        ":" +
        today.getMinutes() +
        ":" +
        today.getSeconds(),
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
