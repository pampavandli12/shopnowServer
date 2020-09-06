/* =================== .env Variables ====================== */
const phoneNumber = process.env.PHONE_NUMBER;
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const adminNumber = process.env.ADMIN_NUMBER;

var nodemailer = require("nodemailer");
const client = require("twilio")(accountSid, authToken);
var transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

const sendOTPEmail = (email, otp, cb) => {
  var mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "OTP for your password reset",
    text: `Hi,
    You requested to reset your password, 
    this is the otp for password reset: ${otp}
    Please verify otp to complete the process
    Regards,
    shopNow`,
  };
  transporter.sendMail(mailOptions, cb);
};

const sendOtpToMobile = (OTP) => {
  return client.messages.create({
    body: `This is the OTP for admin from shopNow: ${OTP}`,
    from: phoneNumber,
    to: adminNumber,
  });
};
module.exports = { sendOTPEmail, sendOtpToMobile };
