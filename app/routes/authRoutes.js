const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/reset-password', authController.resetPassword)
router.post('/verify-email', authController.verifyEmail)
router.post('/resend-verification-email', authController.resendVerificationEmail)
router.post('/request-reset-password', authController.requestResetPassword)

module.exports = router
