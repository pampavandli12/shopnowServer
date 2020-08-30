const express = require("express");

const adminController = require("./controllers/admin");
const Authenticate = require("./controllers/authenticate");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/user", Authenticate);

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>This is from server</h1>");
});
adminController(app);
app.listen(port, () => console.log(`App is listening ap port: ${port}`));
