const User = require('../models/userModel.js')
const bcrypt = require('bcryptjs')
const { sendResponse } = require('../utils/response.js')
const { generateToken } = require('../middlewares/authMiddleware.js')
const sendVerificationEmail = require('../utils/sendVerificationEmail.js')

const register = async (req, res) => {
  const { username, name, email, password } = req.body

  if (!username || !name || !email || !password) {
    return sendResponse(res, false, 'Semua field tidak boleh kosong!', 400)
  }

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return sendResponse(res, false, 'User already exists', 400)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const token = generateToken({ username, email })

    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
      verificationToken: token,
    })

    const savedUser = await newUser.save()

    await sendVerificationEmail(email, token, name)

    sendResponse(res, true, 'User created successfully', 201, {
      user: {
        username: savedUser.username,
        name: savedUser.name,
        email: savedUser.email,
      },
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to create user', 500)
    }
  }
}

const login = async (req, res) => {
  const { input, password } = req.body

  if (!input || !password) {
    return sendResponse(res, false, 'Input/password tidak boleh kosong!', 400)
  }

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

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return sendResponse(res, false, 'Email tidak terdaftar!', 404)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    await user.save()

    sendResponse(res, true, 'Password reset berhasil!', 200)
  } catch (err) {
    sendResponse(res, false, 'Gagal mereset password!', 500)
  }
}

const verifyEmail = async (req, res) => {
  const { token } = req.query

  try {
    console.log('token', token)
    const user = await User.findOne({ verificationToken: token })

    console.log('user', user)

    if (!user) {
      return sendResponse(res, false, 'Token verifikasi tidak valid!', 400)
    }

    // user.isVerified = true
    // user.verificationToken = undefined
    // await user.save()

    sendResponse(res, true, 'Email berhasil diverifikasi!', 200)
  } catch (err) {
    sendResponse(res, false, 'Gagal verifikasi email!', 500)
  }
}

module.exports = { register, login, resetPassword, verifyEmail }
