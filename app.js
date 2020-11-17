require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const xpLogs = require("./routes/api/xpLogs");

const app = express();
// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// DB Config
const db = process.env.DB_URL;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("DB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./services/passport")(passport);

// Routes
app.use("/api/users", users);
app.use("/api/logs", xpLogs);

const port = process.env.PORT || 5000; 

app.listen(port, () => console.log(`Server uuuuuup and running, Jimbo, check on port ${port} !`));