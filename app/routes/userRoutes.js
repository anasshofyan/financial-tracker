const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.post('/login', userController.login)
router.post('/', userController.register)
router.get('/', verifyToken, userController.getList)
router.put('/:id', verifyToken, userController.update)
router.delete('/:id', verifyToken, userController.deleteUser)

module.exports = router
