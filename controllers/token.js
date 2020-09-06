const express = require("express");
const Router = express.Router();
const RefreshToken = require("../models/RefreshToken");
// require modules
const createAccessToken = require("../utils/auth").createAccessToken;
const verifyToken = require("../utils/auth").verifyToken;

/* ================ GET REFRESH TOKEN =============================== */
Router.get("/refreshToken", async (req, res) => {
  const headers = req.headers;
  if (!headers["authorization"]) {
    res.status(403).send("UNAUTHORIZED");
  }
  const token = headers["authorization"].split(" ")[1];
  try {
    const refreshToken = await RefreshToken.findOne({ token: token });
    if (refreshToken) {
      const token = verifyToken(refreshToken.token);
      if (token) {
        const payload = { username: token.username, email: token.email };
        const accToken = createAccessToken(payload);
        res.status(200).send({ token: accToken });
      } else {
        res.status(403).send("Access Denied");
      }
    } else {
      res.status(403).send("Invalid token");
    }
  } catch (error) {
    res.status(500).send("Something went wrong, please try again");
  }
});
/* ================== DELETE ACCESS TOKEN =============== */
Router.delete("/logout", async (req, res) => {
  const headers = req.headers;
  if (!headers["authorization"]) {
    res.status(403).send("UNAUTHORIZED");
  }
  const token = headers["authorization"].split(" ")[1];
  try {
    await RefreshToken.remove({ token: token });
    res.status(200).send("success");
  } catch (error) {
    res.status(500).send("Something went wrong, please try again");
  }
});
module.exports = Router;
