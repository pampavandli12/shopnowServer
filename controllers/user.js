const express = require("express");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const Router = express.Router();

/* ================= IMPORT CUSTOM MODULES =============== */
const util = require("../utils/auth");

/* ========================== SAVE REFRESH TOKEN TO DB ====================== */
const saveRefreshToken = async (token) => {
  const refreshToken = new RefreshToken({ token: token });
  await refreshToken.save();
};
/* ======================= SIGNIN ENDPOINT =========================== */
Router.post("/signin", async (req, res) => {
  const email = req.body.email;
  try {
    const data = await User.findOne({ email: req.body.email });
    if (data) {
      if (await util.comparePassword(req.body.password, data.password)) {
        const payload = { username: data.username, email: data.email };
        const token = util.createAccessToken(payload);
        const refreshToken = util.createRefreshToken(payload);
        res.status(200).send({ message: "Success", token, refreshToken });

        // Store refresh token in DB
        saveRefreshToken(refreshToken);
      } else {
        res.status(401).send("Invalid Credentials");
      }
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("Invalid Credentials");
  }
});

/* ======================= REGISTER ENDPOINT =========================== */
Router.post("/register", async (req, res) => {
  try {
    const data = await User.findOne({ email: req.body.email });
    if (data) {
      res.status(400).send("User already exist");
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
        const payload = { username: respUser.username, email: respUser.email };
        const token = util.createAccessToken(payload);
        const refToken = util.createRefreshToken(payload);
        res.status(200).send({
          message: "User created succesfully",
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

/* ================== JWT AUTHENTICATION ENDPOINT ============================ */
Router.post("/check", util.validateToken, (req, res) => {
  res.status(200).send("authenticated");
});
/* ================ EXPORT ROUTER ======================== */
module.exports = Router;
