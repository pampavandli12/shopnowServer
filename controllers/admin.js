require("dotenv").config();
const phoneNumber = process.env.PHONE_NUMBER;
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const adminNumber = process.env.ADMIN_NUMBER;
const client = require("twilio")(accountSid, authToken);

module.exports = (app) => {
  app.get("/admin/verification", (req, res) => {
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
};
