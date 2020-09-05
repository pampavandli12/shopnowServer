const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");

const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

const Router = express.Router();

/* ================== CREATE ACCESSTOKEN ======================= */
const createJwt = (payload) => {
  return jwt.sign(payload, accessTokenSecretKey, { expiresIn: "15s" });
};

/* ==================== CREATE REFRESHTOKEN ======================== */
const createRefreshToken = (payload) => {
  return jwt.sign(payload, refreshTokenSecretKey);
};

/* ======================= SIGNIN ENDPOINT =========================== */
Router.post("/signin", async (req, res) => {
  const email = req.body.email;
  try {
    const users = await User.find({ email: req.body.email });
    if (users.length != 0) {
      if (await bcrypt.compare(req.body.password, users[0].password)) {
        const payload = { username: users[0].username, email: users[0].email };
        const token = createJwt(payload);
        const refreshToken = createRefreshToken(payload);
        res.status(200).send({ message: "Success", token, refreshToken });

        // Store refresh token in DB
        RefreshToken.create({ token: refreshToken }, (err, data) => {
          if (err) throw err;
        });
      } else {
        res.status(401).send("Invalid Credentials");
      }
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("something went wrong, please try again");
  }
});

/* ======================= REGISTER ENDPOINT =========================== */
Router.post("/register", async (req, res) => {
  try {
    const data = await User.find({ email: req.body.email });
    if (data.length != 0) {
      res.status(400).send("User already exist");
    } else {
      const hasshedPassword = await bcrypt.hash(req.body.password, 10);
      const userData = {
        username: req.body.username,
        email: req.body.email,
        password: hasshedPassword,
        OTP: null,
        cartItems: [],
        orders: [],
      };
      const user = new User(userData);
      try {
        const respUser = await user.save();
        const payload = { username: respUser.username, email: respUser.email };
        const token = createJwt(payload);
        const refToken = createRefreshToken(payload);
        res.status(200).send({
          message: "User created succesfully",
          token,
          refToken,
        });
        const refreshToken = new RefreshToken({
          token: refToken,
        });
        refreshToken.save();
      } catch (error) {}
    }
  } catch (error) {
    throw err;
  }
});

/* ================== JWT AUTHENTICATION ENDPOINT ============================ */
Router.post("/authenticate", async (req, res) => {
  const reqToken = req.body.token;
  try {
    const token = await jwt.verify(reqToken, accessTokenSecretKey);
    if (token) {
      res.status(200).send("token still valid");
    } else {
      res.status(403).send("token not valid");
    }
  } catch (error) {
    res.status(403).send("token is expired");
  }
});

/* ==================== REFRESH TOKEN ENDPOINT ========================= */
Router.post("/refreshToken", async (req, res) => {
  const refTkn = req.body.refToken;
  try {
    const refreshToken = await RefreshToken.findOne({ token: refTkn });
    if (refreshToken) {
      const token = await jwt.verify(refreshToken.token, refreshTokenSecretKey);
      if (token) {
        const payload = { username: token.username, email: token.email };
        const accToken = createJwt(payload);
        res.status(200).send({ token: accToken });
      } else {
        res.status(403).send("Access Denied");
      }
    } else {
      res.status(403).send("Access Denied");
    }
  } catch (error) {
    res.status(500).send("Something went wrong, please try again");
  }
});

/* ================ EXPORT ROUTER ======================== */
module.exports = Router;
