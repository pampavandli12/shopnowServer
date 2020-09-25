const Router = require('express').Router();

Router.get('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'get cart items',
  };
  res.status(200).send(user);
});
Router.post('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'new item added to cart',
  };
  res.status(200).send(user);
});
Router.put('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'item edited',
  };
  res.status(200).send(user);
});
Router.delete('/', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'item removed from cart',
  };
  res.status(200).send(user);
});

module.exports = Router;
