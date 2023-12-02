const express = require("express");
const router = express.Router();

const filesController = require("../controllers/files.controller");

router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    // finish event is emitted once the response is sent to the client
    const diffSeconds = (Date.now() - start) / 1000; // figure out how many seconds elapsed
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

router
  .route("/")
  .get(filesController.findAll)
  // .post(filesController.addMany);
  .post(filesController.addOne);

router.route("/:fileId").get(filesController.findOne);

module.exports = router;
