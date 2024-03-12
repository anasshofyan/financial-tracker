const mongoose = require('mongoose')
const Schema = mongoose.Schema

const walletSchema = new Schema(
  {
    emoji: { type: String, default: '💰' },
    name: { type: String, default: 'Dompet Utama', required: true },
    balance: { type: Number, default: 0 },
    bgWallet: { type: String, default: '#27B427' },
    createBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
)

const Wallet = mongoose.model('Wallet', walletSchema)
module.exports = Wallet
