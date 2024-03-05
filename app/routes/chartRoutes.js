const express = require('express')
const router = express.Router()
const chartController = require('../controllers/chartController')
const { verifyToken } = require('../middlewares/authMiddleware')

router.get('/stacked', verifyToken, chartController.getStackedChartData)
router.get('/pie', verifyToken, chartController.getPieChartData)

module.exports = router
