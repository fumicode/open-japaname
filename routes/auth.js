
var express = require('express');
var auth_router = module.exports = express.Router();

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Japaname = mongoose.model("Japaname");

var _ = require("underscore");

var co = require("co");



auth_router.get("/",(req,res,next)=>{
  res.render("auth/login_signup");
});


auth_router.post("/signup", function (req, res, next) {
  co(function*(){
    var username =  req.body.username;
    var password =  req.body.password;
    var re_password  =  req.body.confirm_password;

    console.log("signing up username " + username);
    console.log("password " + password);
    console.log("re_password " + re_password);

    if(yield User.doesExist(username)){
      var message =  "user exist! error!";
      console.log(message);
      req.flash("error", message);
      return res.redirect(req.baseUrl + "#signup");
    }

    if(password !== re_password){
      var message =  "password not same";
      console.log(message);
      req.flash("error", message);
      return res.redirect(req.baseUrl + "#signup");
    }


    //needs validataion
    console.log("registering: " + username);

    User.register(new User({
      username: req.body.username,
      japaname: Japaname.japanameDecode(japaname_code)
    }), password, function (err, user) {
      if (err) {
        req.flash("error","couldn't add try once");
        return res.redirect(req.baseUrl + "#signup");
      } 

      authenticate_and_redirect_mypage(username,password,req,res);
    });


  }).catch((err)=>{
    next(err);
  });
});

auth_router.post("/login", function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;

  authenticate_and_redirect_mypage(username,password,req,res);
});

auth_router.get('/logout', function(req,res){
  req.logout();
  res.redirect("/");
});



function authenticate_and_redirect_mypage(username,password,req,res,next){

  console.log("here1 " + username + " " + password);
  User.authenticate()(username,password,function(err,user,options){
    
      console.log("here2");
    if (err) return next(err);
    if (user === false) {

      console.log("here");
      //!!!! いずれいれる！！
      //req.flash("error", "Enter same password twice.");
      return res.redirect(req.baseUrl + "#signup");
    } 
    else {
      console.log("here3");
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
