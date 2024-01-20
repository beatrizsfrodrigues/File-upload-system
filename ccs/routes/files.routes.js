const express = require("express");
const router = express.Router();
const filesController = require("../controllers/files.controller");
const authController = require("../controllers/auth.controller");
const multer = require("multer");
const aws = require("aws-sdk");
const db = require("../models");
const fs = require("fs");

require("dotenv/config");

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

router.post("/", authController.verifyToken, upload.single("file"), filesController.addOne);

router.post("/addMany", authController.verifyToken, upload.array("files"), filesController.addMany);

router
  .route("/:fileID")
  .get(authController.verifyToken, filesController.findOne)
  .delete(authController.verifyToken, filesController.deleteFile);

router
  .route("/:fileID/download")
  .get(authController.verifyToken, filesController.downloadFile);

module.exports = router;
