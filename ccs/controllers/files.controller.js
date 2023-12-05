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

// ? add many
exports.addMany = async (req, res) => {
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

      // padStart puts 0 before number if it only has one digit
      let data = `\n${user.id};${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")};${String(
        today.getHours()
      ).padStart(2, "0")}${String(today.getMinutes()).padStart(2, "0")}${String(
        today.getSeconds()
      ).padStart(2, "0")};uploaded ${req.body.files.length} files:
      `;

//! FALTA POR O ID DE CADA FICHEIRO NO LOGBOOK

      for(var i = 0 ; i < req.body.files.length ; i++) {
        let file = await File.create({
          name: req.body.files[i].name,
          path: req.body.files[i].path,
          userId: req.loggedUser.id,
          dateAdded: date,
          dateLastEdited: date,
        });
      }
  
      fs.appendFile("./logbooks/logbook_files.txt", data, (err) => {
        // In case of a error throw err.
        if (err) throw err;
      });

    return res.status(201).json({
      success: true,
      msg:  `${req.body.files.length} Files uploaded successfully!`,
      // file: file,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred.",
    });
  }
};