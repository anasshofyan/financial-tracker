const User = require("../models/userModel");

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: err.message,
    });
  }
};
