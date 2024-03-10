const express = require('express')
const router = express.Router()
const walletController = require('../controllers/walletController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.post('/', verifyToken, walletController.createWallet)
router.get('/', verifyToken, walletController.getWallets)
router.get('/:id/transactions', verifyToken, walletController.getTrsnactionByWallet)
router.put('/:id', verifyToken, walletController.updateWallet)
router.delete('/:id', verifyToken, walletController.deleteWallet)

module.exports = router
