const User = require('../models/userModel.js')
const bcrypt = require('bcryptjs')
const { sendResponse } = require('../utils/response.js')
const { generateToken } = require('../middlewares/authMiddleware.js')
const sendVerificationEmail = require('../utils/sendVerificationEmail.js')

const register = async (req, res) => {
  const { username, name, email, password } = req.body

  if (!username || !name || !email || !password) {
    return sendResponse(res, false, 'Jangan ada yang kosong ya!', 400)
  }

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return sendResponse(res, false, 'User sudah ada nih, coba yang lain ya!', 400)
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

    sendResponse(res, true, 'User berhasil dibuat!', 201, {
      user: {
        username: savedUser.username,
        name: savedUser.name,
        email: savedUser.email,
      },
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Gagal nih, cek lagi deh!', 400, err.errors)
    } else {
      sendResponse(res, false, 'Gagal buat user, coba lagi ya!', 500)
    }
  }
}

const login = async (req, res) => {
  const { input, password } = req.body

  if (!input || !password) {
    return sendResponse(res, false, 'Jangan lupa isi username/email sama passwordnya ya!', 400)
  }

  try {
    const user = await User.findOne({
      $or: [{ username: input }, { email: input }],
    })

    if (!user) {
      return sendResponse(res, false, 'User belum terdaftar, daftar dulu ya!', 401)
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return sendResponse(res, false, 'Username/email atau password salah nih, cek lagi ya!', 401)
    }

    if (!user.isVerified) {
      return sendResponse(res, false, 'Email belum diverifikasi nih, cek emailnya ya!', 401)
    }

    const token = generateToken(user)

    sendResponse(res, true, 'Login berhasil!', 200, {
      token,
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Gagal nih, cek lagi deh!', 400, err.errors)
    }
    sendResponse(res, false, 'Gagal login, coba lagi ya!', 500)
  }
}

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return sendResponse(res, false, 'Email belum terdaftar nih!', 404)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    await user.save()

    sendResponse(res, true, ' Password berhasil direset!', 200)
  } catch (err) {
    sendResponse(res, false, 'Gagal mereset password!', 500)
  }
}

const verifyEmail = async (req, res) => {
  const { token } = req.query

  try {
    const user = await User.findOne({ verificationToken: token })

    console.log('user', user)

    if (!user) {
      return sendResponse(res, false, 'Token verifikasi nggak valid nih!', 400)
    }

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    sendResponse(res, true, 'Email berhasil diverifikasi bro!', 200, {
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    })
  } catch (err) {
    sendResponse(res, false, 'Gagal verifikasi email bro!', 500)
  }
}

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body

  try {
    if (!email) {
      return sendResponse(res, false, 'Email belum diisi nih!', 400)
    }

    const user = await User.findOne({ email })

    if (!user) {
      return sendResponse(res, false, 'Email belum terdaftar nih!', 404)
    }

    const newToken = generateToken(user.username, user.email)

    user.verificationToken = newToken
    await user.save()

    await sendVerificationEmail(email, newToken, user.name)

    sendResponse(res, true, `Email verifikasi berhasil dikirim ulang ke ${email}!`, 200)
  } catch (err) {
    sendResponse(res, false, 'Gagal mengirim ulang email verifikasi!', 500)
  }
}

module.exports = { register, login, resetPassword, verifyEmail, resendVerificationEmail }
