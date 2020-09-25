const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: String,
  title: String,
  price: Number,
  description: String,
  size: String,
  attachments: Array,
});

module.exports = mongoose.model('Product', productSchema);
