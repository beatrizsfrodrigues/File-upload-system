require("dotenv").config(); // read environment variables from .env file
const express = require("express");
const cors = require("cors"); // middleware to enable CORS (Cross-Origin Resource Sharing)
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000; // use environment variables
const host = process.env.HOST || "localhost";

app.use(cors()); // enable ALL CORS requests (client requests from other domains)
app.use(express.json({ limit: "50mb" })); // enable parsing JSON body data
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure Multer with file size limit
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "home" });
});

app.use("/users", require("./routes/users.routes.js"));
app.use("/files", require("./routes/files.routes.js"));

app.all("*", (req, res) => {
  res.status(404).json({ message: "WHAT???" });
});

const server = app.listen(port, host, () => {
  console.log(`App listening at http://${host}:${port}/`);
});

module.exports = { app, server };
