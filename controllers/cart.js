const Router = require('express').Router();

const User = require('../models/User');
const Product = require('../models/Product');

const fetchProductsFromIds = async (cartItem) => {
  try {
    const product = await Product.findById(cartItem.id);
    if (product) {
      const result = product;
      result.price = result.price * cartItem.quantity;
      return result;
    } else {
      return null;
    }
  } catch (error) {
    res.status.send('Something went wrong, please try again');
  }
};
Router.get('/', async (req, res) => {
  try {
    const cart = await User.findOne({ email: req.body.email });
    if (cart) {
      const items = cart.cartItems;
      const productIds = [];
      if (items.length > 0) {
        items.forEach((element) => {
          productIds.push(element.id);
        });
        let productList = [];
        for (let index = 0; index < productIds.length; index++) {
          try {
            const singleProduct = await fetchProductsFromIds(items[index]);
            productList.push(singleProduct);
          } catch (error) {
            res.status(500).send('can not find product with that ID');
          }
        }
        res.status(200).send(productList);
      } else {
        res.status(200).send([]);
      }
    } else {
      res.status(500).send('Not able to fetch data from user');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

Router.post('/', async (req, res) => {
  try {
    const userdata = await User.findOneAndUpdate(
      { email: req.body.email },
      { $push: { cartItems: { id: req.body.id, quantity: 1 } } }
    );
    if (userdata) {
      res.status(200).send('Item added to cart successfully');
    } else {
      res.status(500).send('Item was not able to add to cart');
    }
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});

Router.put('/', async (req, res) => {
  // Update cart items count (if 0 then remove that item) and calculate cart price
  try {
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      let cartItems = userData.cartItems;
      let updatedCartItems;
      if (cartItems.length === 0)
        return res.status(500).send('No cart item found');
      if (req.body.quantity === 0) {
        updatedCartItems = cartItems.filter((item) => item.id != req.body.id);
      } else {
        updatedCartItems = cartItems.map((item) => {
          return { ...item, quantity: req.body.quantity };
        });
      }
      userData.cartItems = updatedCartItems;
      const updatedUser = await User.findOneAndUpdate(
        { email: req.body.email },
        userData
      );
      if (updatedUser) {
        res.status(200).send('Changes to the cart is made');
      } else {
        res.status(500).send('Something went wrong, please try again');
      }
    } else {
      res.status(500).send('Something went wrong, please try again');
    }
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});
Router.delete('/', async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      const resultCart = userData.cartItems.filter(
        (item) => item.id != req.body.id
      );
      const updatedUserData = userData;
      updatedUserData.cartItems = resultCart;
      try {
        const updatedCart = await User.findOneAndUpdate(
          { email: req.body.email },
          updatedUserData
        );
        res.status(200).send('Item removed from cart');
      } catch (error) {
        res.status(500).send('Not able to update cart');
      }
    } else {
      res.status(500).send('Product not found');
    }
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});

module.exports = Router;
