const Category = require('../models/categoryModel')
const Transaction = require('../models/transactionModel.js')
const { cleanAndValidateInput } = require('../utils/cleanAndValidateInput.js')
const { sendResponse } = require('../utils/response.js')

const create = async (req, res) => {
  let { emoji, name, type, parentId } = req.body

  const loggedInUserId = req.decoded.user.id

  emoji = cleanAndValidateInput(emoji)
  name = cleanAndValidateInput(name)
  type = cleanAndValidateInput(type)

  try {
    if (!emoji || !name || !type) {
      return sendResponse(res, false, 'Emoji, name, and type harus diisi nih!', 400)
    }

    const userCategories = await Category.find({ createdBy: loggedInUserId })
    const isParentIdValid = parentId
      ? userCategories.some((category) => category._id.toString() === parentId)
      : true

    if (!isParentIdValid) {
      return sendResponse(res, false, 'Wah, parentId-nya ngaco nih', 400)
    }

    const newCategory = new Category({
      parentId,
      emoji,
      name,
      type,
      createdBy: loggedInUserId,
    })

    const savedCategory = await newCategory.save()

    sendResponse(res, true, 'Uhuy, kategori berhasil dibuat nih!', 201, savedCategory)
  } catch (err) {
    console.log(err)
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Oops, gagal membuat kategori nih, coba lagi nanti ya!', 500)
    }
  }
}

const getList = async (req, res) => {
  try {
    const loggedInUserId = req.decoded.user.id

    const categories = await Category.find({ createdBy: loggedInUserId }).sort({ _id: -1 })

    const result = categories.reduce((acc, curr) => {
      if (!curr.parentId) {
        acc[curr._id] = {
          _id: curr._id,
          emoji: curr.emoji,
          name: curr.name,
          type: curr.type,
          parentCategory: null,
          subCategories: [],
        }
      }
      return acc
    }, {})

    categories.forEach((curr) => {
      if (curr.parentId && result[curr.parentId]) {
        if (!result[curr.parentId].subCategories.find((sub) => sub._id === curr._id)) {
          result[curr.parentId].subCategories.push({
            _id: curr._id,
            emoji: curr.emoji,
            name: curr.name,
            parentId: curr.parentId,
            type: curr.type,
            __v: curr.__v,
          })
        }
      }
    })

    const transformedData = Object.values(result)
    sendResponse(res, true, 'Uhuy, kategori berhasil di fetching.', 200, transformedData)
  } catch (err) {
    sendResponse(res, false, 'Oops, kategori gagal di fetching nih, coba lagi nanti ya!', 500)
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
  let { emoji, name, type, parentId } = req.body
  const loggedInUserId = req.decoded.user.id

  emoji = cleanAndValidateInput(emoji)
  name = cleanAndValidateInput(name)
  type = cleanAndValidateInput(type)

  try {
    if (!emoji || !name || !type) {
      return sendResponse(res, false, 'Emoji, name, and type harus diisi nih!', 400)
    }

    const userCategories = await Category.find({ createdBy: loggedInUserId })
    const isIdvalid = id ? userCategories.some((category) => category._id.toString() === id) : true
    const isParentIdValid = parentId
      ? userCategories.some((category) => category._id.toString() === parentId)
      : true

    if (!isParentIdValid) {
      return sendResponse(res, false, 'Wah, parentId nya ngaco nih!', 400)
    }

    if (!isIdvalid) {
      return sendResponse(res, false, 'Wah, id nya ngaco nih!', 400)
    }

    const categoryToUpdate = await Category.findOne({ _id: id, createdBy: loggedInUserId })
    if (!categoryToUpdate) {
      return sendResponse(
        res,
        false,
        'Oops, kategori tidak ditemukan dan tidak memiliki izin untuk mengaksesnya!',
        404,
      )
    }

    if (parentId) {
      const subCategoriesToUpdate = await Category.find({ parentId: id, createdBy: loggedInUserId })
      await Promise.all(
        subCategoriesToUpdate.map(async (subCategory) => {
          subCategory.parentId = null
          await subCategory.save()
        }),
      )
    }

    categoryToUpdate.emoji = emoji
    categoryToUpdate.name = name
    categoryToUpdate.type = type
    categoryToUpdate.parentId = parentId
    const updatedCategory = await categoryToUpdate.save()

    sendResponse(res, true, 'Uhuy, kategori berhasil di update nih!', 200, updatedCategory)
  } catch (err) {
    if (err.name === 'ValidationError') {
      sendResponse(res, false, 'Validation failed', 400, err.errors)
    } else {
      sendResponse(res, false, 'Oops, kategori gagal update nih, coba lagi nanti ya!', 500)
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
