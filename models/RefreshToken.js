const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const refreshToken = new Schema({
  token: String,
});

module.exports = mongoose.model("RefreshToken", refreshToken);
