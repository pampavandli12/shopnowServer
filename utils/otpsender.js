/* =================== .env Variables ====================== */
const phoneNumber = process.env.PHONE_NUMBER;
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const adminNumber = process.env.ADMIN_NUMBER;

var nodemailer = require('nodemailer');
const client = require('twilio')(accountSid, authToken);
var transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

const sendOTPEmail = (email, otp, cb) => {
  var mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: 'OTP for your password reset',
    html: `<p>Hi, <br />
     You requested to reset your password, 
     this is the OTP for password reset: <b>${otp}</b>.<br />
     Please verify otp to complete the process.<br />
     This OTP will be valid for 30 minutes.</p>
     <div>Regards</div>
     <div>ShopNow</div>`,
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
