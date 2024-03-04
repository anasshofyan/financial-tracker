const Category = require('../models/categoryModel')
const Transaction = require('../models/transactionModel.js')
const { sendResponse } = require('../utils/response.js')

const create = async (req, res) => {
  const { emoji, name, type } = req.body

  const loggedInUserId = req.decoded.user.id

  try {
    const newCategory = new Category({
      emoji,
      name,
      type,
      createdBy: loggedInUserId,
    })

    const savedCategory = await newCategory.save()

    sendResponse(res, true, 'Category created successfully', 201, savedCategory)
  } catch (err) {
    console.log(err)
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to create category', 500)
    }
  }
}

const getList = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id

    const categories = await Category.find({ createdBy: loggedInUserId }).sort({ _id: -1 })

    sendResponse(res, true, 'Get list category success', 200, categories)
  } catch (err) {
    sendResponse(res, false, 'Failed to get list category', 500)
  }
}

const getDetail = async (req, res) => {
  const { id } = req.params
  const loggedInUserId = req.decoded.user.id

  try {
    const category = await Category.findOne({ _id: id, createdBy: loggedInUserId })

    if (!category) {
      return sendResponse(
        res,
        false,
        'Category not found or you do not have permission to access',
        404,
      )
    }

    sendResponse(res, true, 'Get category detail success', 200, category)
  } catch (err) {
    sendResponse(res, false, 'Failed to get category detail', 500)
  }
}

const update = async (req, res) => {
  const { id } = req.params
  const { emoji, name, type } = req.body

  try {
    const loggedInUserId = req.decoded.user.id
    const category = await Category.findOneAndUpdate(
      { _id: id, createdBy: loggedInUserId },
      { emoji, name, type },
      { new: true },
    )

    if (!category) {
      return sendResponse(
        res,
        false,
        'Category not found or you do not have permission to update',
        404,
      )
    }

    sendResponse(res, true, 'Category updated successfully', 200, category)
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to update category', 500)
    }
  }
}

const deleteCategory = async (req, res) => {
  const { id } = req.params
  const loggedInUserId = req.decoded.user.id

  try {
    await Category.findByIdAndDelete({ _id: id, createdBy: loggedInUserId })
    await Transaction.deleteMany({ category: id })

    sendResponse(res, true, 'Category deleted successfully', 200)
  } catch (err) {
    sendResponse(res, false, 'Failed to delete category', 500)
  }
}

module.exports = {
  create,
  getList,
  update,
  deleteCategory,
  getDetail,
}
