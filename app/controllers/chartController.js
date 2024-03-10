const Transaction = require('../models/transactionModel')
const Category = require('../models/categoryModel')
const { sendResponse } = require('../utils/response.js')
const { formatDate } = require('../utils/formatDate.js')
const { cleanAndValidateInput } = require('../utils/cleanAndValidateInput.js')
const { id, ca } = require('date-fns/locale')

const formatDate1 = (date, format) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

const calculateRemainingBalance = (totalIncome, totalExpense) => {
  return totalIncome - totalExpense
}

const getStackedChartData = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    let { startDate, endDate } = req.query

    startDate = cleanAndValidateInput(startDate)
    endDate = cleanAndValidateInput(endDate)

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

    const categoryTotals = await Promise.all(
      transactions.map(async (transaction) => {
        const categoryId = transaction.category._id
        const categoryName = transaction.category.name
        const amount = transaction.amount
        const monthYear = new Date(transaction.date).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
        })

        const parentCategoryId = transaction.category.parentId || categoryId

        const findParentCategory = await Category.findById(parentCategoryId)

        return {
          category: parentCategoryId,
          total: amount,
          monthYear,
          parentCategory: {
            id: parentCategoryId,
            name: findParentCategory ? findParentCategory.name : categoryName,
            emoji: findParentCategory ? findParentCategory.emoji : transaction.category.emoji,
            type: findParentCategory ? findParentCategory.type : transaction.category.type,
          },
          listChildCategory: [
            {
              idTransaction: transaction._id,
              childCategory: {
                id: categoryId,
                name: categoryName,
                emoji: transaction.category.emoji,
                type: transaction.category.type,
                parentId: transaction.category.parentId,
              },
              date: transaction.date,
              description: transaction.description,
              amount,
            },
          ],
        }
      }),
    )

    // Merge and reduce the array of objects into a single object
    const reducedCategoryTotals = categoryTotals.reduce((acc, curr) => {
      const existing = acc[curr.category]
      if (existing) {
        existing.total += curr.total
        existing.listChildCategory.push(...curr.listChildCategory)
      } else {
        acc[curr.category] = curr
      }
      return acc
    }, {})

    // Convert reducedCategoryTotals object to array of objects
    const pieChartData = Object.values(reducedCategoryTotals).map((categoryData) => ({
      category: categoryData.category,
      total: categoryData.total,
      monthYear: categoryData.monthYear,
      parentCategory: categoryData.parentCategory,
      listChildCategory: categoryData.listChildCategory,
    }))

    pieChartData.forEach((categoryData) => {
      categoryData.listChildCategory.sort((a, b) => b.date - a.date)
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
