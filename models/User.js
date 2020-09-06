const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Bcrypt
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  phone: Number,
  OTP: Number,
  cartItems: Array,
  orders: Array,
});
module.exports = mongoose.model("User", userSchema);
