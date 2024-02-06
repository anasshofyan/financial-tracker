const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const { sendResponse } = require('../utils/response.js')
const { generateToken } = require('../middlewares/authMiddleware.js')

const register = async (req, res) => {
  const { username, name, email, password } = req.body

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return sendResponse(res, false, 'User already exists', 400)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
    })

    const savedUser = await newUser.save()

    const token = generateToken(savedUser)

    sendResponse(res, true, 'User created successfully', 201, {
      token,
      user: savedUser,
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to create user', 500)
    }
  }
}

const getList = async (req, res) => {
  try {
    const users = await User.find()
    sendResponse(res, true, 'Get list user success', 200, users)
  } catch (err) {
    sendResponse(res, false, 'Failed to get list user', 500)
  }
}

const update = async (req, res) => {
  const { id } = req.params
  const { username, role, email, password } = req.body

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.findByIdAndUpdate(
      id,
      { username, role, email, password: hashedPassword },
      { new: true },
    )
    sendResponse(res, true, 'Update user success', 200, user)
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to update user', 500)
    }
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdAndDelete(id)
    sendResponse(res, true, 'Delete user success', 200, user)
  } catch (err) {
    sendResponse(res, false, 'Failed to delete user', 500)
  }
}

const login = async (req, res) => {
  const { input, password } = req.body

  try {
    const user = await User.findOne({
      $or: [{ username: input }, { email: input }],
    })

    if (!user) {
      return sendResponse(res, false, 'Data user belum terdaftar, silahkan daftar dulu!', 401)
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return sendResponse(res, false, 'Input/password salah!', 401)
    }

    const token = generateToken(user)

    sendResponse(res, true, 'Login successfully', 200, {
      token,
      user: user,
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    }
    sendResponse(res, false, err.message, 500)
  }
}

module.exports = { register, getList, update, deleteUser, login }
