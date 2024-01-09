const SubCategory = require('../models/subCategoryModel.js')
const { sendResponse } = require('../utils/response.js')
const jwt = require('jsonwebtoken')

const create = async (req, res) => {
  const { icon, name, type } = req.body

  const loggedInUserId = req.decoded.user.id

  try {
    const newSubCategory = new SubCategory({
      icon,
      name,
      type,
      createdBy: loggedInUserId,
    })

    const savedSubCategory = await newSubCategory.save()

    sendResponse(res, true, 'SubCategory created successfully', 201, savedSubCategory)
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to create subCategory', 500)
    }
  }
}

const getList = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id

    const categories = await SubCategory.find({ createdBy: loggedInUserId })

    sendResponse(res, true, 'Get list subCategory success', 200, categories)
  } catch (err) {
    sendResponse(res, false, 'Failed to get list subCategory', 500)
  }
}

const getDetail = async (req, res) => {
  const { id } = req.params
  const loggedInUserId = req.decoded.user.id

  try {
    const subCategory = await SubCategory.findOne({ _id: id, createdBy: loggedInUserId })

    if (!subCategory) {
      return sendResponse(
        res,
        false,
        'SubCategory not found or you do not have permission to access',
        404
      )
    }

    sendResponse(res, true, 'Get subCategory detail success', 200, subCategory)
  } catch (err) {
    sendResponse(res, false, 'Failed to get subCategory detail', 500)
  }
}

const update = async (req, res) => {
  const { id } = req.params
  const { icon, name, type } = req.body

  try {
    const loggedInUserId = req.decoded.user.id
    const subCategory = await SubCategory.findOneAndUpdate(
      { _id: id, createdBy: loggedInUserId },
      { icon, name, type },
      { new: true }
    )

    if (!subCategory) {
      return sendResponse(
        res,
        false,
        'SubCategory not found or you do not have permission to update',
        404
      )
    }

    sendResponse(res, true, 'SubCategory updated successfully', 200, subCategory)
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Failed to update subCategory', 500)
    }
  }
}

const deleteSubCategory = async (req, res) => {
  const { id } = req.params
  const loggedInUserId = req.decoded.user.id

  try {
    await SubCategory.findByIdAndDelete({ _id: id, createdBy: loggedInUserId })
    sendResponse(res, true, 'SubCategory deleted successfully', 200)
  } catch (err) {
    sendResponse(res, false, 'Failed to delete subCategory', 500)
  }
}

module.exports = {
  create,
  getList,
  update,
  deleteSubCategory,
  getDetail,
}
