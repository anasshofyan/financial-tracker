const Wallet = require('../models/walletModel.js')
const { sendResponse } = require('../utils/response.js')
const { cleanAndValidateInput } = require('../utils/cleanAndValidateInput.js')
const Transaction = require('../models/transactionModel.js')

const createWallet = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    let { name, emoji, balance, bgWallet } = req.body

    name = cleanAndValidateInput(name)
    emoji = cleanAndValidateInput(emoji)
    balance = cleanAndValidateInput(balance)

    console.log(name, emoji, balance)

    if (!name || !emoji || !balance || !bgWallet) {
      sendResponse(res, false, 'Semua field harus diisi!', 400)
      return
    }

    const wallet = new Wallet({ name, emoji, balance, bgWallet, createBy: loggedInUserId })
    await wallet.save()
    sendResponse(res, true, 'Yeay! dompet berhasil dibuat!', 200, wallet)
  } catch (error) {
    sendResponse(res, false, 'Failed to create wallet', 500)
  }
}

const getWallets = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id
    const wallet = await Wallet.find({ createBy: loggedInUserId })
    wallet.sort((a, b) => b.createdAt - a.createdAt)
    sendResponse(res, true, 'Berhasil get list wallet', 200, wallet)
  } catch (error) {
    sendResponse(res, false, 'Gagal get list wallet', 500)
  }
}

const getTransactionByWallet = async (req, res) => {
  try {
    const { id } = req.params
    const loggedInUserId = req.decoded.user.id

    if (!id) {
      sendResponse(res, false, 'Wallet id is required', 400)
      return
    }

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
    const { id } = req.params
    const loggedInUserId = req.decoded.user.id
    let { name, emoji, balance, bgWallet } = req.body

    name = cleanAndValidateInput(name)
    emoji = cleanAndValidateInput(emoji)
    balance = cleanAndValidateInput(balance)

    if (!name || !emoji || !balance || !bgWallet) {
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
    wallet.bgWallet = bgWallet
    await wallet.save()

    sendResponse(res, true, 'Wallet berhasil di update!', 200, wallet)
  } catch (error) {
    sendResponse(res, false, 'Failed to update wallet', 500)
  }
}

const deleteWallet = async (req, res) => {
  try {
    const { id } = req.params
    const loggedInUserId = req.decoded.user.id

    await Wallet.deleteOne({ _id: id, createBy: loggedInUserId })
    await Transaction.deleteMany({ walletId: id, createdBy: loggedInUserId })

    sendResponse(res, true, 'Wallet berhasil dihapus!', 200, {})
  } catch (error) {
    console.log(error)
    sendResponse(res, false, 'Failed to delete wallet', 500)
  }
}

module.exports = { createWallet, getWallets, getTransactionByWallet, updateWallet, deleteWallet }
