const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.get('/', verifyToken, categoryController.getList)
router.get('/:id', verifyToken, categoryController.getDetail)
router.post('/', verifyToken, categoryController.create)
router.put('/:id', verifyToken, categoryController.update)
router.delete('/:id', verifyToken, categoryController.deleteCategory)

module.exports = router
