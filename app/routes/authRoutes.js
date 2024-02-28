const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/reset-password', authController.resetPassword)
router.post('/verify-email', authController.verifyEmail)

module.exports = router
