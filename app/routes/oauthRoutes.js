const express = require('express')
const { googleAuth } = require('../controllers/oauthGoogle')
const { authorizationUrl } = require('../config/oauthConfig')
const router = express.Router()

router.get('/google', (req, res) => {
  res.redirect(authorizationUrl)
})

router.get('/google/callback', googleAuth)

module.exports = router
