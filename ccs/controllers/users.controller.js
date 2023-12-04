const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/db.config.js");
const db = require("../models");
const User = db.users;

// * find all users
exports.findAll = async (req, res) => {
  try {
    let users = await User.findAll;
    res.status(200).json({ success: true, users: users });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred",
    });
  }
};

//? signup
exports.createUser = async (req, res) => {
  try {
    let arr = [
      req.body.email,
      req.body.username,
      req.body.name,
      req.body.password,
      req.body.confPassword,
    ];
    let keys = Object.keys(req.body);
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i] || !arr[i].replace(/\s/g, "").length) {
        return res
          .status(400)
          .json({ success: false, msg: `Please provide ${keys[i]}!` });
      }
    }

    if (/\s/g.test(req.body.username)) {
      return res.status(400).json({
        success: false,
        msg: `Your username can't contain spaces!`,
      });
    }

    if (/\s/g.test(req.body.password)) {
      return res.status(400).json({
        success: false,
        msg: `Your password can't contain spaces!`,
      });
    }
    if (!(req.body.password == req.body.confPassword)) {
      return res.status(403).json({
        success: false,
        msg: `The passwords that you provided don't match!`,
      });
    }

    if ((await User.find({ email: req.body.email })).length > 0) {
      return res
        .status(409)
        .json({ success: false, msg: `Email already in use!` });
    } else if ((await User.find({ username: req.body.username })).length > 0) {
      return res
        .status(409)
        .json({ success: false, msg: `Username already in use!` });
    }

    // Save user to DB
    let user = await User.create({
      email: req.body.email,
      username: req.body.username,
      name: req.body.name,
      // password: req.password
      password: bcrypt.hashSync(req.body.password, 10)
    });
    return res.status(201).json({
      success: true,
      msg: "User was registered successfully with the id: ",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while signing up.",
    });
  }
  console.log(res.status);
};

//? login
exports.login = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password)
      return res.status(400).json({
        success: false,
        msg: "Must provide email and password.",
      });

    let user = await User.findOne({ email: req.body.email }); //get user data from DB
    if (!user)
      return res.status(404).json({
        success: false,
        msg: "User not found.",
      });

    // tests a string (password in body) against a hash (password in database)
    const check = bcrypt.compareSync(req.body.password, user.password);
    if (!check)
      return res.status(401).json({
        success: false,
        accessToken: null,
        msg: "Invalid credentials!",
      });

    // sign the given payload (user ID and type) into a JWT payload – builds JWT token, using secret key
    const token = jwt.sign({ id: user.id}, config.SECRET, {
      expiresIn: "24h", // 24 hours
    });
    
    return res.status(200).json({
      success: true,
      accessToken: token,
      user: user,
    });
  } catch (err) {
    // if (err instanceof ValidationError)
    //   res.status(400).json({
    //     success: false,
    //     msg: err.errors.map((e) => e.message),
    //   });
    // else
      res.status(500).json({
        success: false,
        msg: err.message || "Some error occurred at login.",
      });
  }
};