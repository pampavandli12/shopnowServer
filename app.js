// Require modules
const express = require('express');
const mongoose = require('mongoose');
// Load .env variables
require('dotenv').config();
const mongodbUrl = require('./keys/keys');
// Require controllers
const AdminController = require('./controllers/admin');
const User = require('./controllers/user');
const GetToken = require('./controllers/token');
const Products = require('./controllers/product');
const Cart = require('./controllers/cart');
const Authenticate = require('./utils/auth').validateToken;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public')); // Serves resources from public folder

const port = process.env.PORT || 3000;
// DB Connections
mongoose.connect(mongodbUrl, (err) => {
  if (!err) {
    throw err;
  }
  console.log('Successfully connected to DB');
});
app.use('/user', User);
app.use('/admin', AdminController);
app.use('/product', Authenticate, Products);
app.use('/cart', Authenticate, Cart);
app.use('/auth', GetToken);

app.listen(port, () => console.log(`App is listening at port: ${port}`));
