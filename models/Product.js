const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true, maxlength: 50, minlength: 5 },
  title: { type: String, required: true, maxlength: 250, minlength: 5 },
  price: { type: Number, required: true },
  description: { type: String, required: true, maxlength: 500, minlength: 5 },
  size: { type: String, required: true, maxlength: 5, minlength: 1 },
  attachments: { type: Array },
});

module.exports = mongoose.model('Product', productSchema);
