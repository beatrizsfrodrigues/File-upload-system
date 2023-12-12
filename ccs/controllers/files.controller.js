const db = require("../models");
const File = db.files;
const fs = require("fs");

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
    //register the user, date, hour and action
    let data = `\n${req.loggedUser.id};${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()};${String(
      today.getHours()
    ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
      today.getSeconds()
    ).padStart(2, "0")} uploaded file: `;

    //create a new file in the database
    let file = await File.create({
      name: req.body.name,
      path: req.body.path,
      userId: req.loggedUser.id,
      dateAdded: date,
      dateLastEdited: date,
    });

    //attach file id and get the new action on the logbook
    data += `${file.id};`
    fs.appendFile("./logbooks/logbook_files.txt", data, (err) => {
      // In case of a error throw err.
      if (err) throw err;
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

// * add many
exports.addMany = async (req, res) => {
  try {

      // padStart puts 0 before number if it only has one digit
      let data = `\n${user.id};${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${today.getFullYear()};${String(
        today.getHours()
      ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
        today.getSeconds()
      ).padStart(2, "0")}; uploaded ${req.body.files.length} files: `;

      for(var i = 0 ; i < req.body.files.length ; i++) {
        let file = await File.create({
          name: req.body.files[i].name,
          path: req.body.files[i].path,
          userId: req.loggedUser.id,
          dateAdded: date,
          dateLastEdited: date,
        });

        data += `${file.id};`
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

// * get one file
exports.findOne = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileID);
    if (file === null){
      return res.status(404).json({
        success: false,
        msg: `Cannot find any file with ID ${req.params.fileID}`,
      });
    }else if(req.loggedUser.id != file.userId){
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to perform this request!",
      });
  }
    
    return res.status(200).json({
      success: true,
      file: file,
    });
  } catch (err) {
    console.log(err);
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "id parameter is not a valid object id",
      });
    }
    return res.status(500).json({
      success: false,
      msg: `error retrieving file with ID ${req.params.fileID}`,
    });
  }
};

// ! NAO MOSTRA MSG DE SUCESSO
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.fileID);
    if (file === null){
      return res.status(404).json({
        success: false,
        msg: `Cannot find any file with ID ${req.params.fileID}`,
      });
    }else if(req.loggedUser.id != file.userId){
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to perform this request!",
      });
    }

    //update logbook
    let data = `\n${user.id};${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()};${String(
      today.getHours()
    ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
      today.getSeconds()
    ).padStart(2, "0")}; deleted file: ${req.params.fileID}`;

    fs.appendFile("./logbooks/logbook_files.txt", data, (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });

    return res.status(204).json({
      success: true,
      msg: `File with id ${req.params.fileID} was deleted successfully`,
    });

  } catch (err) {
    console.log(err);
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        msg: "id parameter is not a valid object id",
      });
    }
    return res.status(500).json({
      success: false,
      msg: `error retrieving file with ID ${req.params.fileID}`,
    });
  }
};