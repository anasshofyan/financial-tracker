const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  icon: {
    type: String,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
