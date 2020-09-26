const Router = require('express').Router();
const Product = require('../models/Product');
var multer = require('multer');
// ...Express Validators.
const { validationResult } = require('express-validator');

// Custom validation
const Validation = require('../utils/validation');
/* ================= Configure Multer file storage ========================== */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + '-' + file.originalname);
  },
});
var upload = multer({ storage: storage });

/* ==================== to check if user is an admin */
const checkAdmin = (req, res, next) => {
  if (!req.body.isAdmin) {
    return res.status(401).send('Not authorized to create product');
  }
  next();
};

Router.post('/', Validation.createProductValidationList, async (req, res) => {
  // Check for errors during data validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.errors;
    const errorMsg = Validation.parseError(error);
    return res.status(400).json(errorMsg);
  }
  const data = {
    name: req.body.name,
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    size: req.body.size,
    attachments: req.body.attachments,
  };
  const product = new Product(data);
  try {
    const response = await product.save();
    if (response) {
      res.status(200).send('Product created successfully');
    } else {
      res.status(500).send('Something went wrong, please try again');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
Router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send({ products });
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});
Router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const response = await Product.findByIdAndDelete(id);
    if (response) {
      res.status(200).send('Success');
    } else {
      res.status(500).send('Something went wrong, please try again');
    }
  } catch (error) {
    res.status(500).send('Something went wrong, please try again');
  }
});
Router.put('/', (req, res) => {
  // still pending
  const user = {
    email: req.body.email,
    password: req.body.password,
    message: 'update product',
  };
  res.status(200).send(user);
});
/* ================== Attachment Upload ========================= */
Router.post('/upload', upload.array('files'), (req, res) => {
  const files = req.files.map((file) => {
    return {
      mimetype: file.mimetype,
      destination: file.destination,
      filename: file.filename,
      path: `uploads/${file.filename}`,
      size: file.size,
    };
  });
  res.status(200).send(files);
});

module.exports = Router;
