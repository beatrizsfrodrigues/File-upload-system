const express = require("express");
const router = express.Router();

const filesController = require("../controllers/files.controller");
const authController = require("../controllers/auth.controller");

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

router
  .route("/")
  .post(authController.verifyToken, filesController.addOne)
  .get(authController.verifyToken, filesController.findAll);

router
  .route("/addMany")
  .post(authController.verifyToken, filesController.addMany);

router
  .route("/:fileID")
  .get(authController.verifyToken, filesController.findOne)
  .delete(authController.verifyToken, filesController.deleteFile)

// router.route("/:fileId").get(filesController.findOne);

module.exports = router;
