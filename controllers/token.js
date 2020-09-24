const express = require('express');
const Router = express.Router();
const RefreshToken = require('../models/RefreshToken');
const Admin = require('../models/Admin');
const User = require('../models/User');
// require modules
const createAccessToken = require('../utils/auth').createAccessToken;
const verifyToken = require('../utils/auth').verifyToken;
const comparePassword = require('../utils/auth').comparePassword;

const passwordAuthenticate = async (token) => {
  console.log('token here', token);
  if (token.isAdmin) {
    try {
      const data = await Admin.findOne({ email: token.email });
      if (data && (await comparePassword(token.password, data.password))) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  } else {
    try {
      const data = await User.findOne({ email: token.email });
      if (data && (await comparePassword(token.password, data.password))) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
};
const authenticateRefreshToken = async (req, res, next) => {
  const headers = req.headers;
  if (!headers['authorization']) return res.status(403).send('UNAUTHORIZED');
  const token = headers['authorization'].split(' ')[1];
  if (token) {
    try {
      const refreshToken = await RefreshToken.findOne({ token: token });
      if (refreshToken) {
        const token = verifyToken(refreshToken.token);
        const isPasswordVerified = await passwordAuthenticate(token);
        if (isPasswordVerified) {
          req.body.email = token.email;
          req.body.password = token.password;
          if (token.isAdmin) {
            req.body.isAdmin = token.isAdmin;
          } else {
            req.body.username = token.username;
          }
          next();
        } else {
          res.status(403).send('UNAUTHORIZED');
        }
      } else {
        res.status(403).send('UNAUTHORIZED');
      }
    } catch (error) {
      res.status(500).send('Something went wrong, please try again');
    }
  } else {
    res.status(403).send('UNAUTHORIZED');
  }
};
/* ================ GET REFRESH TOKEN =============================== */
Router.get('/refreshToken', authenticateRefreshToken, async (req, res) => {
  const payload = {
    email: req.body.email,
    password: req.body.password,
  };
  if (req.body.isAdmin) {
    payload.isAdmin = req.body.isAdmin;
  } else {
    payload.username = req.body.username;
  }
  const accToken = createAccessToken(payload);
  res.status(200).send({ token: accToken });
});

/* ================== DELETE ACCESS TOKEN =============== */
Router.delete('/logout', async (req, res) => {
  const headers = req.headers;
  if (!headers['authorization']) {
    res.status(403).send('UNAUTHORIZED');
  }
  const token = headers['authorization'].split(' ')[1];
  try {
    await RefreshToken.deleteOne({ token: token });
    res.status(200).send('success');
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});
module.exports = Router;
