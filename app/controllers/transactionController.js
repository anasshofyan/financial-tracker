const Transaction = require('../models/transactionModel')
const Category = require('../models/categoryModel')
const { sendResponse } = require('../utils/response.js')
const { formatDate } = require('../utils/formatDate.js')
const { cleanAndValidateInput } = require('../utils/cleanAndValidateInput.js')

const create = async (req, res) => {
  const loggedInUserId = req.decoded.user.id
  let { amount, description, categoryId, date } = req.body

  amount = cleanAndValidateInput(amount)
  description = cleanAndValidateInput(description)

  try {
    if (!amount || !description || !categoryId || !date) {
      return sendResponse(res, false, 'Semua field harus diisi!', 400)
    }

    const category = await Category.findById(categoryId)

    if (!category) {
      return sendResponse(res, false, 'Category Not Found', 400, {})
    }

    const type = category.type

    const newTransaction = new Transaction({
      amount,
      description,
      category: categoryId,
      date,
      type,
      createdBy: loggedInUserId,
    })

    const savedTransaction = await newTransaction.save()

    sendResponse(res, true, 'Transaction created successfully', 201, savedTransaction)
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to create transaction', 500)
    }
  }
}

const getList = async (req, res) => {
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

    let totalIncome = 0
    let totalExpense = 0

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount
      } else if (transaction.type === 'expense') {
        totalExpense += transaction.amount
      }
    })

    const remainingBalance = totalIncome - totalExpense

    let groupedTransactions = {}

    transactions.forEach((transaction) => {
      const transactionDate = transaction.date
      if (!groupedTransactions[transactionDate]) {
        groupedTransactions[transactionDate] = []
      }
      groupedTransactions[transactionDate].push({
        ...transaction.toObject(),
        date: transaction.date,
      })
      groupedTransactions[transactionDate].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
    })

    const responseData = Object.entries(groupedTransactions)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, transactions]) => ({
        date,
        transactions,
      }))

    sendResponse(res, true, 'Get list transaction success', 200, {
      listGroup: responseData,
      totalIncome,
      totalExpense,
      remainingBalance,
    })
  } catch (err) {
    sendResponse(res, false, 'Failed to get list transaction', 500)
  }
}

const getDetail = async (req, res) => {
  const { id } = req.params
  const loggedInUserId = req.decoded.user.id

  try {
    const transaction = await Transaction.findOne({ _id: id, createdBy: loggedInUserId })

    if (!transaction) {
      return sendResponse(
        res,
        false,
        'Transaction not found or you do not have permission to access',
        404,
      )
    }

    sendResponse(res, true, 'Get transaction detail success', 200, transaction)
  } catch (err) {
    sendResponse(res, false, 'Failed to get transaction detail', 500)
  }
}

const update = async (req, res) => {
  const { id } = req.params
  const loggedInUserId = req.decoded.user.id
  let { amount, description, categoryId, date } = req.body

  try {
    amount = cleanAndValidateInput(amount)
    description = cleanAndValidateInput(description)
  } catch (err) {
    return sendResponse(res, false, err, 400, err.errors)
  }

  if (!amount || !description || !categoryId || !date) {
    return sendResponse(res, false, 'Semua field harus diisi!', 400)
  }

  try {
    let transaction = await Transaction.findById(id).populate('category')

    if (!transaction) {
      return sendResponse(res, false, 'Transaction not found', 404)
    }

    if (transaction.createdBy.toString() !== loggedInUserId.toString()) {
      return sendResponse(res, false, 'Unauthorized', 401)
    }

    const category = await Category.findById(categoryId)

    if (!category) {
      return sendResponse(res, false, 'Category Not Found', 400, {})
    }

    transaction.amount = amount
    transaction.description = description
    transaction.categoryId = categoryId
    transaction.date = date
    transaction.type = category.type
    transaction.category = category
    transaction = await transaction.save()

    sendResponse(res, true, 'Update transaction success', 200, transaction)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return sendResponse(res, false, 'Validation failed', 400, err.errors)
    }
    sendResponse(res, false, 'Failed to update transaction', 500)
  }
}

const deleteTransaction = async (req, res) => {
  const { id } = req.params

  if (!id) {
    return sendResponse(res, false, 'Transaction not found', 404)
  }

  try {
    const transaction = await Transaction.findByIdAndDelete(id)
    sendResponse(res, true, 'Delete transaction success', 200, transaction)
  } catch (err) {
    sendResponse(res, false, 'Failed to delete transaction', 500)
  }
}

module.exports = {
  create,
  getList,
  getDetail,
  update,
  deleteTransaction,
}
