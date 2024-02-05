const express = require('express')
const { authorizationUrl } = require('../config/oauthConfig')
const { oauthController } = require('../controllers/oauthController')
const router = express.Router()

router.get('/google', (req, res) => {
  res.redirect(authorizationUrl)
})

router.get('/google/callback', oauthController)

module.exports = router
