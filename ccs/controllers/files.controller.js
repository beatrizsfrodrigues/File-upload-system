const db = require("../models");
const File = db.files;
const fs = require("fs");
const aws = require("aws-sdk");
const archiver = require("archiver");
require("dotenv/config");

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

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

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
    let files = await File.find({ userId: req.loggedUser.id }).exec();

    if (req.file) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
      };

      s3.upload(params, (error, data) => {
        console.log(data);

        let logData = `\n${req.loggedUser.id};${String(
          today.getDate()
        ).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(
          2,
          "0"
        )}-${today.getFullYear()};${String(today.getHours()).padStart(
          2,
          "0"
        )}:${String(today.getMinutes()).padStart(2, "0")}:${String(
          today.getSeconds()
        ).padStart(2, "0")} uploaded file: `;

        const file = new File({
          name: req.file.originalname,
          userId: req.loggedUser.id,
          dateAdded: date,
          dateLastEdited: date,
          file: data.Location,
        });
        console.log(file);

        let isFile = false;
        files.forEach((aFile) => {
          if (aFile.name === req.file.originalname) {
            isFile = true;
          }
        });

        if (isFile) {
          return res.status(409).json({
            success: false,
            msg: `The file you're trying to upload already exists`,
          });
        } else {
          file.save().then((result) => {
            res.status(200).send({
              _id: result._id,
              name: result.name,
              userId: req.loggedUser.id,
              dateAdded: date,
              dateLastEdited: date,
              file: data.Location,
            });

            //attach file id and get the new action on the logbook
            logData += `${file.id};`;
            fs.appendFile("./logbooks/logbook_files.txt", logData, (err) => {
              // In case of a error throw err.
              if (err) throw err;
            });
          });
        }
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "No file provided. Please provide a valid file for upload.",
      });
    }
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
    let files = await File.find({ userId: req.loggedUser.id }).exec();

    const zip = archiver("zip");

    // Create a stream to store the zip data
    const zipStream = fs.createWriteStream("temp.zip");

    // Pipe the zip data to the stream
    zip.pipe(zipStream);

    // Loop through each file in req.files and add it to the zip archive
    for (const file of req.files) {
      zip.append(file.buffer, { name: file.originalname });
    }

    // Finalize the zip archive
    zip.finalize();

    // Once the zip is finalized, upload it to S3
    zipStream.on("close", () => {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.body.name + ".zip",
        Body: fs.createReadStream("temp.zip"),
      };

      s3.upload(params, (error, data) => {
        // Delete the temporary zip file
        fs.unlinkSync("temp.zip");

        if (error) {
          res.status(500).send({ err: error });
        }

        console.log(data);

        let logData = `\n${req.loggedUser.id};${String(
          today.getDate()
        ).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(
          2,
          "0"
        )}-${today.getFullYear()};${String(today.getHours()).padStart(
          2,
          "0"
        )}:${String(today.getMinutes()).padStart(2, "0")}:${String(
          today.getSeconds()
        ).padStart(2, "0")} uploaded file: `;

        const file = new File({
          name: req.body.name,
          userId: req.loggedUser.id,
          dateAdded: date,
          dateLastEdited: date,
          file: data.Location,
        });

        let isFile = false;
        files.forEach((aFile) => {
          if (aFile.name === file.name) {
            isFile = true;
          }
        });

        if (isFile) {
          return res.status(409).json({
            success: false,
            msg: `A file with the name ${req.body.name} already exists`,
          });
        } else {
          file.save().then((result) => {
            res.status(200).send({
              _id: result._id,
              name: result.name,
              userId: req.loggedUser.id,
              dateAdded: date,
              dateLastEdited: date,
              file: data.Location,
            });

            //attach file id and get the new action on the logbook
            logData += `${file.id};`;
            fs.appendFile("./logbooks/logbook_files.txt", logData, (err) => {
              // In case of a error throw err.
              if (err) throw err;
            });
          });
        }
      });
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
    if (file === null) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find any file with ID ${req.params.fileID}`,
      });
    } else if (req.loggedUser.id != file.userId) {
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

// * delete one file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.fileID);
    if (file === null) {
      return res.status(404).json({
        success: false,
        msg: `Cannot find any file with ID ${req.params.fileID}`,
      });
    } else if (req.loggedUser.id != file.userId) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to perform this request!",
      });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.name,
    };

    s3.deleteObject(params, (error, data) => {
      if (error) {
        res.status(500).send(error);
      }

      //update logbook
      let logData = `\n${req.loggedUser.id};${String(today.getDate()).padStart(
        2,
        "0"
      )}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${today.getFullYear()};${String(today.getHours()).padStart(
        2,
        "0"
      )}:${String(today.getMinutes()).padStart(2, "0")}:${String(
        today.getSeconds()
      ).padStart(2, "0")} deleted file: `;

      logData += `${file.id};`;
      fs.appendFile("./logbooks/logbook_files.txt", logData, (err) => {
        // In case of a error throw err.
        if (err) throw err;
      });

      return res.status(202).json({
        success: true,
        msg: `File with id ${req.params.fileID} was deleted successfully`,
      });
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

// * download one file
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileID);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.status(200).json({
      success: true,
      download_link: file.file,
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
