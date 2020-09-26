const express = require('express');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Router = express.Router();

// ...Express Validators.
const { validationResult } = require('express-validator');

// Custom validation
const Validation = require('../utils/validation');
/* ================= IMPORT CUSTOM MODULES =============== */
const util = require('../utils/auth');
const sendOTPEmail = require('../utils/otpsender').sendOTPEmail;
const { hashPassword, comparePassword } = require('../utils/auth');

/* ========================== SAVE REFRESH TOKEN TO DB ====================== */
const saveRefreshToken = async (token) => {
  const refreshToken = new RefreshToken({ token: token });
  await refreshToken.save();
};

/* ======================= SIGNIN ENDPOINT =========================== */
Router.post('/signin', Validation.signInValidationList, async (req, res) => {
  // Check for errors during data validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.errors;
    const errorMsg = Validation.parseError(error);
    return res.status(400).json(errorMsg);
  }
  const email = req.body.email;
  try {
    const data = await User.findOne({ email: req.body.email });
    if (data) {
      if (await util.comparePassword(req.body.password, data.password)) {
        const payload = {
          username: data.username,
          email: data.email,
          password: req.body.password,
        };
        const token = util.createAccessToken(payload);
        const refreshToken = util.createRefreshToken(payload);
        res.status(200).send({ message: 'Success', token, refreshToken });

        // Store refresh token in DB
        saveRefreshToken(refreshToken);
      } else {
        res.status(401).send('Invalid Credentials');
      }
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Invalid Credentials');
  }
});

/* ======================= REGISTER ENDPOINT =========================== */
Router.post('/register', Validation.signUpValidationList, async (req, res) => {
  // Check for errors during data validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.errors;
    const errorMsg = Validation.parseError(error);
    return res.status(400).json(errorMsg);
  }
  try {
    const data = await User.findOne({ email: req.body.email });
    if (data) {
      res.status(400).send('User already exist');
    } else {
      const hasshedPassword = await util.hashPassword(req.body.password);
      const userData = {
        username: req.body.username,
        email: req.body.email,
        password: hasshedPassword,
        phone: req.body.phone,
        OTP: null,
        cartItems: [],
        orders: [],
      };
      const user = new User(userData);
      try {
        const respUser = await user.save();
        const payload = {
          username: respUser.username,
          email: respUser.email,
          password: req.body.password,
        };
        const token = util.createAccessToken(payload);
        const refToken = util.createRefreshToken(payload);
        res.status(200).send({
          message: 'User created succesfully',
          token,
          refToken,
        });
        saveRefreshToken(refToken);
      } catch (error) {}
    }
  } catch (error) {
    throw err;
  }
});

/* =============== SEND OTP FOR RESET PASSWORD =============================== */
Router.post('/sendotp', Validation.emailValidation, async (req, res) => {
  // Check for errors during data validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.errors;
    const errorMsg = Validation.parseError(error);
    return res.status(400).json(errorMsg);
  }
  try {
    const data = await User.findOne({ email: req.body.email });
    if (data) {
      let OTP = Math.floor(100000 + Math.random() * 900000);
      sendOTPEmail(req.body.email, OTP, (err, info) => {
        if (err) {
          res.status(500).send('Email is not valid');
        } else {
          res
            .status(200)
            .send('OTP send successfully, OTP will be valid till 30 minutes');
          setTimeout(async () => {
            await User.updateOne({ email: req.body.email }, { OTP: null });
          }, 3000000);
        }
      });
      try {
        const data = await User.updateOne(
          { email: req.body.email },
          { OTP: OTP }
        );
      } catch (error) {
        res.status(500).send('Something went wrong, please try again');
      }
    } else {
      res.status(401).send('Email does not exist');
    }
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});

/* ==================== VERIFY OTP AND PASSWORD ==================== */
const checkOtpandPassword = async (req, res, next) => {
  try {
    const data = await User.findOne({ email: req.body.email });
    if (data) {
      if (data.OTP === req.body.reqOtp) {
        if (await comparePassword(req.body.password, data.password)) {
          res.status(400).send('You can not set previous password');
        } else {
          next();
        }
      } else {
        res.status(400).send('OTP did not match');
      }
    } else {
      res.status(400).send('user not found');
    }
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
};

/* ================== RESET PASSWORD ======================== */
Router.post('/resetpassword', checkOtpandPassword, async (req, res) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    const data = await User.updateOne(
      { email: req.body.email },
      { password: hashedPassword, OTP: null }
    );
    if (data) {
      res.status(200).send('Your password has been reset successfully');
    } else {
      req.status(400).send('No user found');
    }
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});

/* ================== JWT TEST CHECK ENDPOINT ============================ */
Router.post('/check', util.validateToken, (req, res) => {
  res.status(200).send('authenticated');
});

/* ================ EXPORT ROUTER ======================== */
module.exports = Router;
