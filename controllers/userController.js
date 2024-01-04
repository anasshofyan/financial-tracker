const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response.js");

const secretKey = process.env.SECRET_KEY;

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return sendResponse(res, false, "User already exists", 400);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Create and return a JWT token
    const token = jwt.sign(
      {
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
        },
      },
      secretKey
    );

    sendResponse(res, true, "User created successfully", 201, {
      token,
      user: savedUser,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      sendResponse(res, false, "Validation failed", 400, err.errors);
    } else {
      sendResponse(res, false, "Failed to create user", 500);
    }
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    sendResponse(res, true, "Get list user success", 200, users);
  } catch (err) {
    sendResponse(res, false, "Failed to get list user", 500);
  }
};

module.exports = { register, getUsers };
