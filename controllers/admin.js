/* =================== .env Variables ====================== */
const phoneNumber = process.env.PHONE_NUMBER;
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const adminNumber = process.env.ADMIN_NUMBER;

const client = require("twilio")(accountSid, authToken);
const express = require("express");
const Router = express.Router();

/* =============== IMPORT MODELS ================ */
const Admin = require("../models/Admin");
const RefreshToken = require("../models/RefreshToken");

/* ================== IMPORT CUSTOM MODULES =================== */
const util = require("../utils/auth");

Router.get("/verification", (req, res) => {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  client.messages
    .create({
      body: `This is the OTP for admin from shopnow: ${OTP}`,
      from: phoneNumber,
      to: adminNumber,
    })
    .then((message) => {
      console.log(message);
      res.send("OTP send successfully");
    })
    .catch((err) => console.log(err));
});
Router.post("/signin", async (req, res) => {
  const email = req.body.email;
  try {
    const data = await Admin.findOne({ email: email });
    if (data) {
      const password = req.body.password;
      if (await util.comparePassword(password, data.password)) {
        const payload = { email: data.email, isAdmin: data.isAdmin };
        const acctoken = util.createAccessToken(payload, "20s");
        const reftoken = util.createRefreshToken(payload);
        res.status(200).send({
          message: "Successfully loged in",
          token: acctoken,
          reftoken,
        });
        const refreshtoken = new RefreshToken({ token: reftoken });
        refreshtoken.save();
      } else {
        res.status(401).send("Invalid credentials");
      }
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    throw error;
  }
});
Router.post("/check", util.validateToken, (req, res) => {
  res.status(200).send("Token is valid");
});
/* Router.post("/createAdmin", async (req, res) => {
  const hashedPasswerd = await hashPassword(req.body.password);
  const admin = new Admin({
    email: req.body.email,
    password: hashedPasswerd,
    isAdmin: true,
    OTP: null,
  });
  try {
    const data = await admin.save();
    if (data) {
      res.send("success");
    } else {
      res.send("failed to create");
    }
  } catch (error) {
    throw error;
    res.send("something went wrong");
  }
}); */
Router.post("/verifyotp", async (req, res) => {
  const reqOtp = req.body.otp;
  try {
    const admin = await Admin.findOne();
    console.log(admin);
    if (admin) {
      if (admin.OTP === reqOtp) {
        res.status(200).send("OTP verified successfully");
      } else {
        res.status(401).send("OTP is invalid");
      }
    } else {
      res.status(500).send("No admin found");
    }
  } catch (error) {
    console.log(error);
  }
});
Router.post("/resetpassword", async (req, res) => {
  const newPassword = req.body.password;
  const hashedPasswerd = await util.hashPassword(newPassword);
  try {
    const data = await Admin.update(
      { email: "pampavandli141@outlook.com" },
      { password: hashedPasswerd }
    );
    res.status(200).send("Password reset completed successfully");
  } catch (error) {
    res.status(500).send("No admin found");
  }
});
module.exports = Router;
