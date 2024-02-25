const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    username: { type: String },
    name: { type: String, minlength: 3 },
    emoji: { type: String, default: '😎' },
    email: {
      type: String,
      required: [true, 'Email is required!'],
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    googleId: { type: String },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model('User', userSchema)
module.exports = User
