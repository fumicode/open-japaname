
var express = require('express');
var auth_router = module.exports = express.Router();

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Japaname = mongoose.model("Japaname");

var _ = require("underscore");

var co = require("co");

var passport = require("passport");



auth_router.get("/",(req,res,next)=>{
  co(function*(){
    if(req.query.japaname && Japaname.isJapanameCode(req.query.japaname)){
      var japaname = yield Japaname.findByCode(req.query.japaname).
        populate("names.ateji").populate("names.kana").exec();

      console.log(japaname);
      if(japaname){
        return res.render("auth/login_signup", {japaname});
      }
    }

    res.render("auth/login_signup");

  }).catch((err)=>{
    next(err);
  })
});


auth_router.post("/signup", passport.authenticate("local-signup",{
  failureRedirect: "/auth#signup",
  failureFlash: true,
}),function(req,res,next){
  co(function*(){

    if(req.body.japaname){
      console.log("hogehoge");
      req.user.my_japaname = req.body.japaname;

      console.log(req.user.my_japaname);

      //asdfasdga:sldgja]
      //lksjdfs
      var result = yield req.user.save();

      //!!res check!!
    }
    res.redirect("/mypage");

  }).catch((err)=>{
    next(err)
  });
}); 

auth_router.post("/login", passport.authenticate("local-login",{
  successRedirect: "/mypage",
  failureRedirect: "/auth#login", 
  failureFlash: true,
}));


auth_router.get('/logout', function(req,res){
  req.logout();
  res.redirect("/");
});


function authenticate_and_redirect_mypage(username,password,req,res,next){

  console.log("Here1 " + username + " " + password);
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
        if(err) return next(err);
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
