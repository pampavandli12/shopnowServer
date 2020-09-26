// ...Express Validators.
const { body } = require('express-validator');

/* ================== Parse Error ======================== */
const parseError = (errors) => {
  let error = '';
  errors.forEach((err) => {
    error += `${error ? ' and ' : ''}Invalid ${err.param}`;
  });
  return error;
};

/* ============== Signin validation list */
const signInValidationList = [
  body('email').isEmail(),
  body('password').isLength({
    min: 6,
  }),
];

/* =================== Email validation ================== */
const emailValidation = [body('email').isEmail()];

/* ================== Signup validation list */
const signUpValidationList = [
  body('username').isString().isLength({ min: 5, max: 50 }),
  ...signInValidationList,
  body('phone').isMobilePhone(),
];

/* ================ Create Product validation list ================= */
const createProductValidationList = [
  body('name').isString().isLength({ min: 5, max: 50 }),
  body('title').isString().isLength({ min: 5, max: 50 }),
  body('price')
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        return Promise.reject('Price can not be negitive');
      }
      return Promise.resolve();
    }),
  body('description').isString().isLength({ min: 5, max: 250 }),
  body('size').isString().isLength({ min: 1, max: 1 }),
];

module.exports = {
  parseError,
  signInValidationList,
  signUpValidationList,
  emailValidation,
  createProductValidationList,
};
