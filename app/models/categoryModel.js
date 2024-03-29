const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  emoji: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
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
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
