const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Bcrypt
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  OTP: Number,
  cartItems: Array,
  orders: Array,
});
userSchema.pre("save", (next) => {
  try {
    // hash your password here
    next();
  } catch (error) {
    next();
  }
});
module.exports = mongoose.model("User", userSchema);
