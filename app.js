// Require modules
const express = require("express");
const mongoose = require("mongoose");
// Load .env variables
require("dotenv").config();

// Require controllers
const AdminController = require("./controllers/admin");
const Authenticate = require("./controllers/authenticate");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

// DB Connections
mongoose.connect(process.env.MONGODB_URL, (err) => {
  if (!err) {
    throw err;
  }
  console.log("Successfully connected to DB");
});

app.get("/", (req, res) => {
  res.send("<h1>This is from server</h1>");
});
app.use("/user", Authenticate);
app.use("/admin", AdminController);

app.listen(port, () => console.log(`App is listening ap port: ${port}`));
