const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const { sendResponse } = require('../utils/response.js')
const { cleanAndValidateInput } = require('../utils/cleanAndValidateInput.js')
const Wallet = require('../models/walletModel.js')

const getList = async (req, res) => {
  try {
    const users = await User.find()
    sendResponse(res, true, 'Get list user success', 200, users)
  } catch (err) {
    sendResponse(res, false, 'Failed to get list user', 500)
  }
}

const getMe = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const user = await User.findById(loggedInUserId).select('-password -role')
    sendResponse(res, true, 'Get user success', 200, user)
  } catch (err) {
    sendResponse(res, false, 'Failed to get user', 500)
  }
}

const getSetting = async (req, res) => {
  const loggedInUserId = req.decoded.user.id
  try {
    const user = await User.findById(loggedInUserId).select(
      'cycleStartDate darkMode selectedWallet',
    )
    sendResponse(res, true, 'Get user setting success', 200, user)
  } catch (err) {
    sendResponse(res, false, 'Failed to get user setting', 500)
  }
}

const setting = async (req, res) => {
  const loggedInUserId = req.decoded.user.id
  const { cycleStartDate, darkMode, selectedWallet } = req.body
  try {
    let updateFields = {}

    if (cycleStartDate) {
      const startDate = parseInt(cycleStartDate, 10)
      if (isNaN(startDate) || startDate < 1 || startDate > 31) {
        sendResponse(res, false, 'Siklus Tanggal Awal harus berada antara 1 dan 31!', 400)
        return
      }
      updateFields.cycleStartDate = cycleStartDate
    }
    if (darkMode !== undefined) {
      updateFields.darkMode = darkMode
    }

    const wallet = await Wallet.findOne({ _id: selectedWallet, createBy: loggedInUserId })

    if (!wallet) {
      sendResponse(res, false, 'Dompet tidak ditemukan!', 404)
      return
    }

    const user = await User.findByIdAndUpdate(loggedInUserId, updateFields, selectedWallet, {
      new: true,
    })

    let successMessage = 'Siklus tanggal awal berhasil disimpan!'
    if (darkMode !== undefined) {
      successMessage = 'Pengaturan dark mode berhasil disimpan!'
    }

    sendResponse(res, true, successMessage, 200, {
      username: user.username,
      email: user.email,
      cycleStartDate: user.cycleStartDate,
      darkMode: user.darkMode,
    })
  } catch (err) {
    sendResponse(res, false, 'Gagal menyimpan pengaturan!', 500)
  }
}

const update = async (req, res) => {
  const { id } = req.params
  let { username, role, email, password } = req.body

  username = cleanAndValidateInput(username)
  role = cleanAndValidateInput(role)
  password = cleanAndValidateInput(password)
  try {
    email = cleanAndValidateInput(email)
  } catch (err) {
    sendResponse(res, false, err.message, 400)
    return
  }

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

module.exports = { getList, update, deleteUser, getMe, setting, getSetting }
