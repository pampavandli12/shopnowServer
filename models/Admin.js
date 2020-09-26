const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const admin = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  isAdmin: { type: Boolean, required: true },
  OTP: { type: Number },
});

module.exports = mongoose.model('Admin', admin);
