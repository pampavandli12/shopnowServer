const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  OTP: { type: Number },
  cartItems: { type: Array },
  orders: { type: Array },
});
module.exports = mongoose.model('User', userSchema);
