const express = require("express");
const router = express.Router();
const filesController = require("../controllers/files.controller");
const authController = require("../controllers/auth.controller");
const multer = require("multer");
const aws = require("aws-sdk")
const db = require("../models");
const File = db.files;
const fs = require("fs");

require("dotenv/config")

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
        cb(null, '')
    }

})

const upload = multer({ storage: storage });

const s3 = new aws.S3({
  accessKeyId:process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
})


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
  .get(authController.verifyToken, filesController.findAll);
  
router.post("/", authController.verifyToken, upload.single('file'), async (req, res) => {
  console.log(req.file)
    const params = {
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:req.file.originalname,
        Body:req.file.buffer,
    };

    s3.upload(params,(error,data)=>{
      if(error){
          res.status(500).send({"err":error})
      }
      console.log(data)

      let logData = `\n${req.loggedUser.id};${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${today.getFullYear()};${String(
        today.getHours()
      ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
        today.getSeconds()
      ).padStart(2, "0")} uploaded file: `;

      const file = new File({
          name: req.body.name,
          userId: req.loggedUser.id,
          dateAdded: date,
          dateLastEdited: date,
          file: data.Location
      });
      file.save()
          .then(result => {
              res.status(200).send({
                  _id: result._id,
                  name: result.name,
                  userId: req.loggedUser.id,
                  dateAdded: date,
                  dateLastEdited: date,
                  file: data.Location,
              })

              //attach file id and get the new action on the logbook
              logData += `${file.id};`
              fs.appendFile("./logbooks/logbook_files.txt", logData, (err) => {
                // In case of a error throw err.
                if (err) throw err;
              });
          })
          .catch(err => {
              res.send({ message: err })
          })
  })
})

// (authController.verifyToken, filesController.addOne)

router
  .route("/addMany")
  .post(authController.verifyToken, filesController.addMany);

router
  .route("/:fileID")
  .get(authController.verifyToken, filesController.findOne)
  .delete(authController.verifyToken, filesController.deleteFile)
  
router.route("/:fileID/download")
  .get(authController.verifyToken, filesController.downloadFile)


module.exports = router;
