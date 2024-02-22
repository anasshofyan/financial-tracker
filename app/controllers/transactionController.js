const Transaction = require('../models/transactionModel')
const Category = require('../models/categoryModel')
const { sendResponse } = require('../utils/response.js')
const { formatDate } = require('../utils/formatDate.js')

const create = async (req, res) => {
  const { amount, description, categoryId, date } = req.body

  const loggedInUserId = req.decoded.user.id

  try {
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
      dateFilter.date = { $gte: startDate, $lte: endDate }
    }

    const transactions = await Transaction.find(dateFilter).populate({
      path: 'category',
      model: 'Category',
    })

    // Objek untuk menyimpan transaksi yang dikelompokkan berdasarkan tanggal
    const groupedTransactions = {}

    // Hitung total pendapatan, total pengeluaran, dan sisa saldo
    let totalIncome = 0
    let totalExpense = 0

    transactions.forEach((transaction) => {
      // Menggunakan tanggal transaksi sebagai kunci untuk mengelompokkan transaksi
      const transactionDate = formatDate(transaction.date)
      if (!groupedTransactions[transactionDate]) {
        groupedTransactions[transactionDate] = []
      }
      groupedTransactions[transactionDate].push({
        ...transaction.toObject(),
        date: formatDate(transaction.date), // Format ulang tanggal di dalam setiap transaksi
      })

      // Hitung total pendapatan dan pengeluaran
      if (transaction.type === 'income') {
        totalIncome += transaction.amount
      } else if (transaction.type === 'expense') {
        totalExpense += transaction.amount
      }
    })

    // Hitung sisa saldo
    const remainingBalance = totalIncome - totalExpense

    // Konversi objek groupedTransactions menjadi array dengan tambahan field date
    const responseData = Object.entries(groupedTransactions).map(([date, transactions]) => ({
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

    console.log('transaction', transaction)
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
  const { amount, description, categoryId, type } = req.body

  try {
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, description, categoryId, type },
      { new: true },
    )
    sendResponse(res, true, 'Update transaction success', 200, transaction)
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to update transaction', 500)
    }
  }
}

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const transaction = await Transaction.findByIdAndDelete(id)
    sendResponse(res, true, 'Delete transaction success', 200, transaction)
  } catch (err) {
    sendResponse(res, false, 'Failed to delete transaction', 500)
  }
}

module.exports = { create, getList, getDetail, update, deleteTransaction }
