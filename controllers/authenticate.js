const express = require("express");
const jwt = require("jsonwebtoken");
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

const Router = express.Router();

Router.post("/signin", (req, res) => {
  const username = req.body.username;
  const payload = { username };
  const token = jwt.sign(payload, accessTokenSecretKey);
  res.send(token);
});

module.exports = Router;
