const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const app = express();
const static = express.static(__dirname + "/public");
const token_check = require('./data/token_check');

const configRoutes = require("./routes");
const exphbs = require("express-handlebars");

app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
//app.use(token_check.verifyToken());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () =>
{
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});