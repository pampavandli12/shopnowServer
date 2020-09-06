// require modules
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

/* ============== CREATE ACCESS TOKEN ==================== */
const createAccessToken = (payload, expirein = "20s") => {
  return jwt.sign(payload, accessTokenSecretKey, { expiresIn: expirein });
};
/* ================ CREATE REFRESH TOKEN ================ */
const createRefreshToken = (payload) => {
  return jwt.sign(payload, refreshTokenSecretKey);
};
/* =============== HASH PASSWORD ======================== */
const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};
/* ================ COMPARE PASSWORD =================== */
const comparePassword = (password, hashedpassword) => {
  return bcrypt.compare(password, hashedpassword);
};

/* ======================= REFRESH TOKEN VARIFY ================== */
const verifyToken = (token) => {
  return jwt.verify(token, refreshTokenSecretKey);
};
/* ================ VALIDATE TOKEN MIDLEWARE =========== */
const validateToken = async (req, res, next) => {
  const headers = req.headers;
  if (!headers["authorization"]) {
    res.status(403).send("UNAUTHORIZED");
  }
  const reqJwt = headers["authorization"].split(" ")[1];
  console.log("token is ", reqJwt);
  try {
    const token = jwt.verify(reqJwt, accessTokenSecretKey);
    if (token) {
      next();
    } else {
      res.status(401).send("Token is invalid");
    }
  } catch (error) {
    res.status(402).send("JWT expired");
  }
};
module.exports = {
  createAccessToken,
  createRefreshToken,
  hashPassword,
  comparePassword,
  validateToken,
  verifyToken,
};