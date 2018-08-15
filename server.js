var express = require("express");
var app = express();
var port = process.env.PORT || 8080;
var morgan = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var router = express.Router();
var appRoutes = require("./app/routes/api")(router);
var path = require("path");

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/api", appRoutes);

//
// <---------- REPLACE WITH YOUR MONGOOSE CONFIGURATION ---------->
//
mongoose.connect(
  "mongodb://localhost:27017/msapps",
  function(err) {
    if (err) {
      console.log("Not connected to the database: " + err); // Log to console if unable to connect to database
    } else {
      console.log("Successfully connected to MongoDB"); // Log to console if able to connect to database
    }
  }
);

// Set Application Static Layout
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/app/views/index.html")); // Set index.html as layout
});

// Start Server
app.listen(port, function() {
  console.log("Running the server on port " + port); // Listen on configured port
});
