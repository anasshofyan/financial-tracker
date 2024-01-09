const express = require('express')
const router = express.Router()
const subCategoryController = require('../controllers/subCategoryController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.get('/', verifyToken, subCategoryController.getList)
router.get('/:id', verifyToken, subCategoryController.getDetail)
router.post('/', verifyToken, subCategoryController.create)
router.put('/:id', verifyToken, subCategoryController.update)
router.delete('/:id', verifyToken, subCategoryController.deleteSubCategory)

module.exports = router
