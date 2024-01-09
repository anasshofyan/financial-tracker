const Transaction = require('../models/transactionModel')
const { sendResponse } = require('../utils/response.js')

const create = async (req, res) => {
  const { amount, description, category, type } = req.body

  const loggedInUserId = req.decoded.user.id

  try {
    const newTransaction = new Transaction({
      amount,
      description,
      category,
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

    const transactions = await Transaction.find({ createdBy: loggedInUserId }).populate({
      path: 'category',
      model: 'Category',
      populate: {
        path: 'subCategories',
        model: 'Subcategory',
      },
    })

    sendResponse(res, true, 'Get list transaction success', 200, transactions)
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
        404
      )
    }

    sendResponse(res, true, 'Get transaction detail success', 200, transaction)
  } catch (err) {
    sendResponse(res, false, 'Failed to get transaction detail', 500)
  }
}

const update = async (req, res) => {
  const { id } = req.params
  const { amount, description, category, type } = req.body

  try {
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, description, category, type },
      { new: true }
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
