const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.get('/', verifyToken, userController.getList)
router.get('/me', verifyToken, userController.getMe)
router.put('/:id', verifyToken, userController.update)
router.delete('/:id', verifyToken, userController.deleteUser)
router.post('/settings', verifyToken, userController.setting)

module.exports = router
