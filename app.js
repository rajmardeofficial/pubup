const express = require("express");
const Razorpay = require("razorpay");
const bodyparser = require("body-parser");
const request = require("request");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/"));
app.use(bodyparser.urlencoded({ extended: true }));

// Mongodb connection url
mongoose.connect("mongodb://localhost:27017/clubs", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  firstName: String,
  email: String,
  contactNumber: String,
  gender: String,
  birthday: String,
  aniversary: String,
  password: String,
});

const clubdataSchema = new mongoose.Schema({
  clubname: String,
  email: String,
  contactnumber: String,
  disc: String,
  tagofevent: String,
  venue: String,
  entryfees: String,
  theme: String,
  dj: String,
  address: String,
});

userSchema.plugin(passportLocalMongoose);
const clubUsers = mongoose.model("clubUsers", userSchema);
const clubowner = mongoose.model("clubowner", clubdataSchema);
passport.use(clubUsers.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

//razorpay logic goes here
let instance = new Razorpay({
  key_id: "rzp_test_zdzlPwPUae1Qzv",
  key_secret: "RbJB4zzx59CY7jM0OEpNtzpM",
});

app.post("/createOrder/:id", (req, res) => {
  // const { amount, currency } = req.body;
  const id = req.params.id;
  console.log(id);
  clubowner.findById(id, (err, result) => {
    if (!err) {
      // res.render("info", {
      //   data: result,
      // });
      let options = {
        amount: result.entryfees * 100, // amount in the smallest currency unit
        currency: "INR",
      };
      // console.log(amount, currency);
      instance.orders.create(options, function (err, order) {
        res.send(order);
      });
    } else {
      console.log(err);
    }
  });
});

//Razorpay logic ends here

app.get("/", function (req, res) {
  res.render("login");
});

app.get("/info/:id", function (req, res) {
  const id = req.params.id;
  clubowner.findById(id, (err, result) => {
    if (!err) {
      res.render("info", {
        data: result,
      });
      // console.log(result);
    } else {
      console.log("something went wrong data was not fetched");
    }
  });
});

app.get("/clubs", function (req, res) {
  clubowner.find((err, result) => {
    if (!err) {
      res.render("clubs", {
        data: result,
      });
      // console.log(result);
    } else {
      console.log("something went wrong data was not fetched");
    }
  });
});

app.get("/clubowners", function (req, res) {
  res.render("clubowners");
});

app.post("/clubowners", function (req, res) {
  const clubname = req.body.clubname;
  const email = req.body.email;
  const contactnumber = req.body.contactnumber;
  const disc = req.body.disc;
  const tagofevent = req.body.tagofevent;
  const venue = req.body.venue;
  const entryfees = req.body.entryfees;
  const theme = req.body.theme;
  const dj = req.body.dj;
  const address = req.body.address;

  const data = new clubowner({
    clubname: clubname,
    email: email,
    contactnumber: contactnumber,
    disc: disc,
    tagofevent: tagofevent,
    venue: venue,
    entryfees: entryfees,
    theme: theme,
    dj: dj,
    address: address,
  });
  data.save();

  res.redirect("/clubowners");
});

app.post("/login", function (req, res) {
  clubUsers.register(
    { username: req.body.firstName },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("login");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("clubs");
        });
      }
    }
  );
});

app.listen(process.env.PORT || 2000, function () {
  console.log("server is running successfully on port made by om kadam");
});
