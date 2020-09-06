const express = require("express");
const Router = express.Router();

/* =============== IMPORT MODELS ================ */
const Admin = require("../models/Admin");
const RefreshToken = require("../models/RefreshToken");

/* ================== IMPORT CUSTOM MODULES =================== */
const util = require("../utils/auth");
const sendOtpToMobile = require("../utils/otpsender").sendOtpToMobile;

/* =================== SIGNIN ENDPOINT ============================ */
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

/* =================== TEST JWT ENDPOINT =============================== */
Router.post("/check", util.validateToken, (req, res) => {
  res.status(200).send("Token is valid");
});

/* ================= CREATE ADMIN END POINT ======================= */
/* Router.post("/createAdmin", async (req, res) => {
  const hashedPassword = await hashPassword(req.body.password);
  const admin = new Admin({
    email: req.body.email,
    password: hashedPassword,
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

/* ===================== SEND OTP END POINT ==================== */
Router.get("/verification", async (req, res) => {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  try {
    const message = await sendOtpToMobile(OTP);
    if (message) {
      res
        .status(200)
        .send("OTP send succefssfully, it will be valid for 30 minutes");
      await Admin.updateOne({ email: process.env.ADMIN_EMAIL }, { OTP: OTP });
      setTimeout(async () => {
        await Admin.updateOne(
          { email: process.env.ADMIN_EMAIL },
          { OTP: null }
        );
      }, 3000000);
    } else {
      res.status(500).send("something went wrong, plaese try again");
    }
  } catch (error) {
    res.status(500).send("Something went wrong, please try again");
  }
});

/* ================ AUTHENTICATE OTP AND PASSWORD MIDDLEWARE =================== */
const authenticateOTP = async (req, res, next) => {
  const reqOtp = req.body.reqOtp;
  try {
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (admin) {
      if (admin.OTP === reqOtp) {
        if (await util.comparePassword(req.body.password, admin.password)) {
          res.status(400).send("You can not set previous password");
        } else {
          next();
        }
      } else {
        res.status(401).send("OTP is invalid");
      }
    } else {
      res.status(500).send("No admin found");
    }
  } catch (error) {
    console.log(error);
  }
};

/* =================== RESET PASSWORD END POINT ====================== */
Router.post("/resetpassword", authenticateOTP, async (req, res) => {
  const newPassword = req.body.password;
  const hashedPassword = await util.hashPassword(newPassword);
  try {
    const data = await Admin.update(
      { email: process.env.ADMIN_EMAIL },
      { password: hashedPassword }
    );
    if (data) {
      res.status(200).send("Password reset completed successfully");
      await Admin.updateOne({ email: process.env.ADMIN_EMAIL }, { OTP: null });
    } else {
      res.status(500).send("Something went wrong, please try again");
    }
  } catch (error) {
    res.status(400).send("No admin found");
  }
});
module.exports = Router;
