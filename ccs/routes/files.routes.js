const express = require("express");
const router = express.Router();
const filesController = require("../controllers/files.controller");
const authController = require("../controllers/auth.controller");
const multer = require("multer");
const aws = require("aws-sdk");
const db = require("../models");
const File = db.files;
const fs = require("fs");

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

// const storage = multer.diskStorage({
const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
});

const upload = multer({ storage: storage });

router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const diffSeconds = (Date.now() - start) / 1000;
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

router.route("/").get(authController.verifyToken, filesController.findAll);

router.post(
  "/",
  authController.verifyToken,
  upload.single("file"),
  filesController.addOne
);

// (authController.verifyToken, filesController.addOne)

router
  .route("/addMany")
  .post(authController.verifyToken, filesController.addMany);

router
  .route("/:fileID")
  .get(authController.verifyToken, filesController.findOne)
  .delete(authController.verifyToken, filesController.deleteFile);

router
  .route("/:fileID/download")
  .get(authController.verifyToken, filesController.downloadFile);

module.exports = router;
