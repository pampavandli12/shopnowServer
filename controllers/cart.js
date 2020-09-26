const Router = require('express').Router();

const User = require('../models/User');

Router.get('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'get cart items',
  };
  res.status(200).send(user);
  // Return all the cart items with total price for perticular user
});
Router.post('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'new item added to cart',
  };
  res.status(200).send(user);
  // Add new cart item to perticular user and calculate cartprice
});
Router.put('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'item edited',
  };
  res.status(200).send(user);
  // Update cart items count (if 0 then remove that item) and calculate cart price
});
Router.delete('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'item removed from cart',
  };
  res.status(200).send(user);
  // Delete perticular cart item from user model and calculate total cart price
});

module.exports = Router;
