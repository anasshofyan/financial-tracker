const express = require('express')
const router = express.Router()
const transactionController = require('../controllers/transactionController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.get('/', verifyToken, transactionController.getList)
router.get('/:id', verifyToken, transactionController.getDetail)
router.post('/', verifyToken, transactionController.create)
router.put('/:id', verifyToken, transactionController.update)
router.post('/visualization', verifyToken, transactionController.getVisualizationData)
router.delete('/:id', verifyToken, transactionController.deleteTransaction)

module.exports = router
