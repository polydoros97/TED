var express               = require('express');
var User                  = require('../models/user.js');
var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passport              = require('passport');
var bodyParser            = require("body-parser");

var router = express.Router();

//login controller
router.post('/login', function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      return res.render('err.ejs', { error: info.message })
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      req.session.Auth = user;
      if(user.isAdmin){
        return res.redirect('/admin/' + user._id);
      }
      console.log("LoggedIn: " + req.session.Auth.email);
      return res.redirect('/home/' + user._id);
    });
  })(req, res, next);
});

//logout controller
router.get("/logout", function(req, res){
  console.log(req.session.Auth.email +" Logged Out");
  req.logout();
  res.redirect("/");
});

//index controller
router.get("/",function(req,res){
  res.render("index.ejs",{error:""});
});

//register controller (get)
router.get("/register",function(req,res){
  res.render("register.ejs",{error : ""});
});

//register controller (post)
router.post("/register", function(req, res){
    //check if password and passwordCheck are the same
    if(req.body.password != req.body.passwordCheck)
      return res.render("register.ejs", {error: "Password don't match"});

    //create new user from request's form
    var newUser = new User({email     : req.body.username,
                            firstname : req.body.firstname,
                            lastname  : req.body.lastname,
                            birthdate : req.body.birthdate
    });

    //register new user to users collection (via mongoose)
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("index.ejs", {error: "Register Failed. Email already exists"});
        }
        else{
          //log in the new user
          passport.authenticate("local")(req, res, function(){
            req.session.Auth = user;
            //redirect to logged user's home page
            console.log(req.session.Auth.email + " Registered Succesfully");
            res.redirect("home/" + user._id);
          });
        }
    });
    //if this point is reached, registration was sucessful
});

module.exports = router;
