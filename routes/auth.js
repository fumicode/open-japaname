
var express = require('express');
var auth_router = module.exports = express.Router({strict:"true"});

var mongoose = require("mongoose");
var User = mongoose.model("User");

var _ = require("underscore");

var co = require("co");



auth_router.get("/signup/",(req,res,next)=>{
  res.render("auth/signup");
});


auth_router.get("/login/",(req,res,next)=>{
  res.render("auth/login");
});

auth_router.post("/signup/", function (req, res) {

    var username =  req.body.username;
    var password =  req.body.password;

    console.log("username" + username);
    console.log("password" + password);

    //needs validataion
    console.log("registering: " + username);

    User.register(new User({
      username: req.body.username,
    }), password, function (err, user) {
      if (err) {
        return res.redirect(req.baseUrl + "/signup/");
      } 

      authenticate_and_redirect_mypage(username,password,req,res);
    });
});

auth_router.post("/login/", function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;

  authenticate_and_redirect_mypage(username,password,req,res);
});

auth_router.get('/logout/', function(req,res){
  req.logout();
  res.redirect("/");
});



function authenticate_and_redirect_mypage(username,password,req,res,next){
  User.authenticate()(username,password,function(err,user,options){
    if (err) return next(err);
    if (user === false) {

      //!!!! いずれいれる！！
      //req.flash("error", "Enter same password twice.");
      return res.redirect(req.baseUrl + "/signup/");
    } 
    else {
      req.login(user, function (err) {
        return res.redirect("/mypage/");
      });
    }
  });
}


/*
router.get('/facebook/callback',
    passport.authenticate('facebook',{
      successRedirect: '/mypage',
      failureRedirect: '/',
    }));

router.get('/facebook/login',
    passport.authenticate('facebook',{scope:['email']}));

*/
