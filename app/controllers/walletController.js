const Wallet = require('../models/walletModel.js')
const { sendResponse } = require('../utils/response.js')
const { cleanAndValidateInput } = require('../utils/cleanAndValidateInput.js')
const Transaction = require('../models/transactionModel.js')
const Category = require('../models/categoryModel.js')

const createWallet = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const { name, emoji, balance } = cleanAndValidateInput(req.body)

    if (!name || !emoji || !balance || !idUser) {
      sendResponse(res, false, 'Semua field harus diisi!', 400)
      return
    }

    const wallet = new Wallet({ name, emoji, balance, createBy: loggedInUserId })
    await wallet.save()
    sendResponse(res, true, 'Yeay! dompet berhasil dibuat!', 200, wallet)
  } catch (error) {
    sendResponse(res, 400, error)
  }
}

const getWallets = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const wallet = await Wallet.find({ createBy: loggedInUserId })
    sendResponse(res, true, 'Get list wallet success', 200, wallet)
  } catch (error) {
    sendResponse(res, false, 'Failed to get list wallet', 500)
  }
}

const getTrsnactionByWallet = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const { id } = req.params
    const transactions = await Transaction.find({ walletId: id, createdBy: loggedInUserId })

    if (!transactions) {
      sendResponse(res, false, 'Transaction not found', 404)
      return
    }

    sendResponse(res, true, 'Get transaction by wallet success', 200, transactions)
  } catch (error) {
    sendResponse(res, false, 'Failed to get transaction by wallet', 500)
  }
}

const updateWallet = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const { id } = req.params
    const { name, emoji, balance } = cleanAndValidateInput(req.body)

    if (!name || !emoji || !balance) {
      sendResponse(res, false, 'Semua field harus diisi!', 400)
      return
    }

    const wallet = await Wallet.findById(id)

    if (!wallet) {
      sendResponse(res, false, 'Wallet not found', 404)
      return
    }

    if (wallet.createBy.toString() !== loggedInUserId.toString()) {
      sendResponse(res, false, 'Unauthorized', 401)
      return
    }

    wallet.name = name
    wallet.emoji = emoji
    wallet.balance = balance
    wallet.categoryId = categoryId
    await wallet.save()
    sendResponse(res, true, 'Wallet berhasil diupdate!', 200, wallet)
  } catch (error) {
    sendResponse(res, false, 'Failed to update wallet', 500)
  }
}

const deleteWallet = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const { id } = req.params
    const wallet = await Wallet.findById(id)

    if (!wallet) {
      sendResponse(res, false, 'Wallet not found', 404)
      return
    }

    if (wallet.createBy.toString() !== loggedInUserId.toString()) {
      sendResponse(res, false, 'Unauthorized', 401)
      return
    }

    await wallet.remove()
    sendResponse(res, true, 'Wallet berhasil dihapus!', 200, wallet)
  } catch (error) {
    sendResponse(res, false, 'Failed to delete wallet', 500)
  }
}

module.exports = { createWallet, getWallets, getTrsnactionByWallet, updateWallet, deleteWallet }
