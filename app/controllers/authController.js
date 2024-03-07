const User = require('../models/userModel.js')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { sendResponse } = require('../utils/response.js')
const { generateToken } = require('../middlewares/authMiddleware.js')
const Category = require('../models/categoryModel.js')
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require('../utils/sendVerificationEmail.js')
const { cleanAndValidateInput } = require('../utils/cleanAndValidateInput.js')

const register = async (req, res) => {
  let { username, name, email, password } = req.body

  username = cleanAndValidateInput(username)
  name = cleanAndValidateInput(name)
  password = cleanAndValidateInput(password)

  try {
    email = cleanAndValidateInput(email, 'email')
  } catch (error) {
    return sendResponse(res, false, error.message, 400)
  }

  if (!username || !name || !email || !password) {
    return sendResponse(res, false, 'Jangan ada field yang kosong ya!', 400)
  }

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return sendResponse(res, false, 'Username sudah ada nih, coba user yang lain ya!', 400)
    }

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return sendResponse(res, false, 'Email sudah terdaftar nih, coba email yang lain ya!', 400)
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

    const verificationResult = await sendVerificationEmail(email, token, name)

    const defaultCategories = [
      { emoji: '🍔', name: 'Makan dan Minuman', type: 'expense', createdBy: savedUser._id },
      { emoji: '🚗', name: 'Transportasi', type: 'expense', createdBy: savedUser._id },
      { emoji: '💰', name: 'Gaji', type: 'income', createdBy: savedUser._id },
      { emoji: '💸', name: 'Freelance', type: 'income', createdBy: savedUser._id },
      { emoji: '🛒', name: 'Belanja', type: 'expense', createdBy: savedUser._id },
      { emoji: '📱', name: 'Pulsa', type: 'expense', createdBy: savedUser._id },
      { emoji: '🎮', name: 'Game', type: 'expense', createdBy: savedUser._id },
      { emoji: '🎫', name: 'Hiburan', type: 'expense', createdBy: savedUser._id },
      { emoji: '🎁', name: 'Hadiah', type: 'expense', createdBy: savedUser._id },
      { emoji: '🎓', name: 'Pendidikan', type: 'expense', createdBy: savedUser._id },
      { emoji: '🏠', name: 'Sewa', type: 'expense', createdBy: savedUser._id },
      { emoji: '🔌', name: 'Listrik', type: 'expense', createdBy: savedUser._id },
      { emoji: '🚿', name: 'Air', type: 'expense', createdBy: savedUser._id },
      { emoji: '📞', name: 'Telepon', type: 'expense', createdBy: savedUser._id },
      { emoji: '📺', name: 'TV Kabel', type: 'expense', createdBy: savedUser._id },
      { emoji: '📡', name: 'Internet', type: 'expense', createdBy: savedUser._id },
      { emoji: '🚑', name: 'Asuransi', type: 'expense', createdBy: savedUser._id },
      { emoji: '🏥', name: 'Kesehatan', type: 'expense', createdBy: savedUser._id },
      { emoji: '👕', name: 'Pakaian', type: 'expense', createdBy: savedUser._id },
      { emoji: '👠', name: 'Sepatu', type: 'expense', createdBy: savedUser._id },
      { emoji: '👜', name: 'Tas', type: 'expense', createdBy: savedUser._id },
      { emoji: '🕶', name: 'Kacamata', type: 'expense', createdBy: savedUser._id },
      { emoji: '💄', name: 'Kosmetik', type: 'expense', createdBy: savedUser._id },
      { emoji: '📚', name: 'Buku', type: 'expense', createdBy: savedUser._id },
    ]

    await Category.insertMany(defaultCategories)

    if (!verificationResult.success) {
      await User.findByIdAndDelete(savedUser._id)
      await Category.deleteMany({ createdBy: savedUser._id })
      return sendResponse(
        res,
        false,
        'Ups, Gagal mengirim email verifikasi, silahkan register kembali!',
        500,
      )
    }

    sendResponse(
      res,
      true,
      'User berhasil dibuat! Email verifikasi telah dikirim ke ' + email,
      201,
      {
        user: {
          username: savedUser.username,
          name: savedUser.name,
          email: savedUser.email,
          isVerified: savedUser.isVerified,
        },
      },
    )
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Gagal buat user nih, cek lagi deh!', 400, err.errors)
    } else {
      sendResponse(res, false, 'Gagal buat user, coba lagi ya!', 500)
    }
  }
}
const login = async (req, res) => {
  let { input, password } = req.body

  input = cleanAndValidateInput(input)
  password = cleanAndValidateInput(password)

  if (!input || !password) {
    return sendResponse(
      res,
      false,
      'Field username/email sama passwordnya tidak boleh kosong ya!',
      400,
    )
  }

  try {
    const user = await User.findOne({
      $or: [{ username: input }, { email: input }],
    })

    if (!user) {
      return sendResponse(res, false, 'User belum terdaftar nih, coba daftar dulu ya!', 401)
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return sendResponse(res, false, 'Username/email atau password salah nih, cek lagi ya!', 401)
    }

    if (!user.isVerified) {
      return sendResponse(res, false, 'Email belum diverifikasi nih, cek emailnya ya!', 401)
    }

    const token = generateToken(user)

    sendResponse(res, true, 'Yeay! Login berhasil!', 200, {
      token,
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        cycleStartDate: user.cycleStartDate,
      },
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Gagal nih, cek lagi deh!', 400, err.errors)
    }
    sendResponse(res, false, 'Gagal login, coba lagi ya!', 500)
  }
}

const requestResetPassword = async (req, res) => {
  let { email } = req.body

  try {
    email = cleanAndValidateInput(email, 'email')
  } catch (error) {
    return sendResponse(res, false, error.message, 400)
  }

  if (!email) {
    return sendResponse(res, false, 'Email belum diisi nih!', 400)
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return sendResponse(res, false, 'Email belum terdaftar nih!', 404)
    }

    const resetToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    await sendResetPasswordEmail(email, resetToken, user.name)

    sendResponse(res, true, 'Email reset password berhasil dikirim ke ' + user.email, 200)
  } catch (err) {
    console.log('err', err)
    sendResponse(res, false, 'Gagal mengirim email reset password!', 500)
  }
}

const resetPassword = async (req, res) => {
  let { token, newPassword } = req.body

  newPassword = cleanAndValidateInput(newPassword)

  try {
    if (!token || !newPassword) {
      return sendResponse(
        res,
        false,
        'Field token reset password atau password baru belum diisi nih!',
        400,
      )
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return sendResponse(
        res,
        false,
        'Token reset password sudah nggak valid nih, coba kirimkan ulang email pada halaman lupa password ya!',
        400,
      )
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    sendResponse(res, true, 'Password berhasil direset!', 200)
  } catch (err) {
    sendResponse(res, false, 'Gagal mereset password!', 500)
  }
}

const verifyEmail = async (req, res) => {
  const { token } = req.query

  try {
    if (!token) {
      return sendResponse(res, false, 'Token verifikasi belum diisi nih!', 400)
    }

    const user = await User.findOne({ verificationToken: token })

    if (!user) {
      return sendResponse(
        res,
        false,
        'Token verifikasi sudah nggak valid nih, coba kirim ulang verifikasi!',
        400,
      )
    }

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    sendResponse(res, true, 'Uhuy, Email berhasil diverifikasi nih!', 200, {
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
  let { email } = req.body

  try {
    email = cleanAndValidateInput(email, 'email')
  } catch (error) {
    return sendResponse(res, false, error.message, 400)
  }

  try {
    if (!email) {
      return sendResponse(res, false, 'Email belum diisi nih!', 400)
    }

    const user = await User.findOne({ email })

    if (!user) {
      return sendResponse(res, false, 'Email belum terdaftar nih!', 404)
    }

    if (user.isVerified) {
      return sendResponse(res, false, 'Email sudah diverifikasi nih!', 400)
    }

    const newToken = generateToken(user.username, user.email)

    user.verificationToken = newToken
    await user.save()

    await sendVerificationEmail(email, newToken, user.name)

    sendResponse(
      res,
      true,
      `Email verifikasi berhasil dikirim ulang ke ${email}, silahkan cek inbox kemudian klik verifikasi!`,
      200,
    )
  } catch (err) {
    sendResponse(res, false, 'Gagal mengirim ulang email verifikasi!', 500)
  }
}

module.exports = {
  register,
  login,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  requestResetPassword,
}
