const Transaction = require('../models/transactionModel')
const Category = require('../models/categoryModel')
const { sendResponse } = require('../utils/response.js')
const { formatDate } = require('../utils/formatDate.js')

const formatDate1 = (date, format) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

const calculateRemainingBalance = (totalIncome, totalExpense) => {
  return totalIncome - totalExpense
}

const getStackedChartData = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const { startDate, endDate } = req.query

    const dateFilter = {
      createdBy: loggedInUserId,
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      dateFilter.date = { $gte: start, $lte: end }
    }

    const transactions = await Transaction.find(dateFilter).populate({
      path: 'category',
      model: 'Category',
    })

    let groupedData = {}
    transactions.forEach((transaction) => {
      const transactionMonthYear = formatDate1(transaction.date, 'MMMM YYYY')
      if (!groupedData[transactionMonthYear]) {
        groupedData[transactionMonthYear] = {
          totalIncome: 0,
          totalExpense: 0,
        }
      }
      if (transaction.type === 'income') {
        groupedData[transactionMonthYear].totalIncome += transaction.amount
      } else if (transaction.type === 'expense') {
        groupedData[transactionMonthYear].totalExpense += transaction.amount
      }
    })

    const chartData = Object.entries(groupedData)
      .map(([date, data]) => {
        const formattedDate = formatDate(new Date(date))
        return {
          date: formattedDate,
          totalIncome: data.totalIncome,
          totalExpense: data.totalExpense,
          remainingBalance: calculateRemainingBalance(data.totalIncome, data.totalExpense),
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB - dateA
      })

    const totalIncome = chartData.reduce((acc, curr) => acc + curr.totalIncome, 0)
    const totalExpense = chartData.reduce((acc, curr) => acc + curr.totalExpense, 0)
    const remainingBalance = calculateRemainingBalance(totalIncome, totalExpense)

    sendResponse(res, true, 'Get visualization data success', 200, {
      chartData,
      totalIncome,
      totalExpense,
      remainingBalance,
    })
  } catch (err) {
    sendResponse(res, false, 'Failed to get visualization data', 500)
  }
}

const getPieChartData = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query
    const loggedInUserId = req.decoded.user.id

    const dateFilter = {
      createdBy: loggedInUserId,
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      dateFilter.date = { $gte: start, $lte: end }
    }

    if (type && type !== 'all') {
      dateFilter.type = type
    }

    const transactions = await Transaction.find(dateFilter).populate({
      path: 'category',
      model: 'Category',
    })

    // Group transactions by category and sum the amounts
    const categoryTotals = transactions.reduce((acc, transaction) => {
      const category = transaction.category.name
      const amount = transaction.amount
      const type = transaction.type
      const monthYear = new Date(transaction.date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
      })
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          type,
          monthYear,
          emoji: transaction.category.emoji,
          list: [],
        }
      }
      acc[category].total += amount
      acc[category].list.push({
        id: transaction._id,
        emoji: transaction.category.emoji,
        category: transaction.category.name,
        description: transaction.description,
        amount,
        date: transaction.date,
      })
      return acc
    }, {})

    // Convert categoryTotals object to array of objects
    const pieChartData = Object.keys(categoryTotals).map((category) => ({
      category,
      total: categoryTotals[category].total,
      type: categoryTotals[category].type,
      monthYear: categoryTotals[category].monthYear,
      emoji: categoryTotals[category].emoji,
      list: categoryTotals[category].list,
    }))

    pieChartData.forEach((categoryData) => {
      categoryData.list.sort((a, b) => b.date - a.date)
    })

    // Sort pieChartData by total in descending order
    pieChartData.sort((a, b) => b.total - a.total)

    sendResponse(res, true, 'Successfully retrieved pie chart data', 200, pieChartData)
  } catch (err) {
    sendResponse(res, false, 'Failed to get visualization data', 500)
  }
}

module.exports = {
  getStackedChartData,
  getPieChartData,
}
