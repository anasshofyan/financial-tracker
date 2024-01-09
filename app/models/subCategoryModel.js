const mongoose = require('mongoose')

const subcategorySchema = new mongoose.Schema({
  icon: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const Subcategory = mongoose.model('Subcategory', subcategorySchema)

module.exports = Subcategory
