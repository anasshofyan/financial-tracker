const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required!"], minlength: 3 },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minlength: 6,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
