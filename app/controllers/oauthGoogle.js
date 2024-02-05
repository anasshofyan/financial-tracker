const User = require('../models/userModel')
const { sendResponse } = require('../utils/response.js')
const { generateToken } = require('../middlewares/authMiddleware.js')
const { oauth2Client } = require('../config/oauthConfig.js')
const { google } = require('googleapis')

const googleAuth = async (req, res) => {
  const { code } = req.query
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })

  const { data } = await oauth2.userinfo.get()

  if (!data.email || !data.name) {
    return sendResponse(res, false, 'Not found data', 400, {})
  }

  const existingUser = await User.findOne({ email: data.email })
  if (existingUser) {
    return sendResponse(res, false, 'User already exists', 400)
  }

  const newUser = new User({
    googleId: data.id,
    googleAccessToken: tokens.access_token,
    googleRefreshToken: tokens.refresh_token,
    username: data.name,
    email: data.email,
    picture: data.picture,
  })

  const savedUser = await newUser.save()

  const token = generateToken(savedUser)

  sendResponse(res, true, 'User Oauth Google successfully Created', 201, {
    token,
    user: savedUser,
  })

  res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`)
}

module.exports = { googleAuth }
