const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const refreshToken = new Schema({
  token: { type: String },
});

module.exports = mongoose.model('RefreshToken', refreshToken);
