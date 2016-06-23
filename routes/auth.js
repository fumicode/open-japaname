var express = require('express');
var router = express.Router();


var session = require("express-session");
var passport = require("passport");
var flash    = require("connect-flash");
var parseAtejiUrl = require("./atejis").parseAtejiUrl;
var _us = require("underscore");


var mongoose = require("mongoose");
var Ateji= mongoose.model("Ateji");



router.get('/login', function(req, res){
  //既にログインしていたら、マイページに飛ぶ
  if(req.user){
    res.redirect("/mypage");
    return ;
  }

  // リダイレクトURLが存在したら
  var redirect_url = req.query.redirect_url;

  // 最近当て字をもっていたら
  var ateji_id = req.cookies.ateji_id;
  
  //当て字をみつける
  Ateji.findAtejiById(ateji_id, function(ateji){
    //見つかったら、わたす
    res.render("auth/login", {
      ateji:ateji,
      redirect_url: redirect_url,
    });

  },function(err){
    //みつからなかったら、渡さない。それだけ。

    res.render("auth/login", {
      redirect_url: redirect_url,
    });
  });
});


router.post('/local/login', 
  passport.authenticate("local-login",{
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  function(req,res,next){
    if(req.body.redirect_url){
      res.redirect(req.body.redirect_url);
      return;
    }

    res.redirect("/mypage");
  }
);


router.get('/local/logout', function(req,res){
  req.logout();
  res.redirect("/auth/login");
});

router.post('/local/signup', 
  function(req, res,next){
    if( req.body.password == req.body.confirm_password){
      next();
      return;
    }
    
    else{
      console.log("different passwords !!!!!!!!!!!!!!!");
      req.flash("error", "Enter same password twice.");
      res.redirect("/auth/login#signup");
    }   
  },
  passport.authenticate("local-signup",{
    failureRedirect: "/auth/login#signup",
    failureFlash: true,
  }),
  function(req,res,next){
    if(req.body.redirect_url){
      res.redirect(req.body.redirect_url);
      return;
    }

    res.redirect("/mypage");
  }
);

router.get('/emailtest', function(req,res){
  res.render("auth/emailtest", {data:{
   getrequest:"testing",
  }});
});

router.post('/emailtest', function(req,res){

  var nodemailer = require('nodemailer');

  var sesTransport = require('nodemailer-ses-transport');

  // create reusable transporter object using SMTP transport
  var transporter = nodemailer.createTransport(sesTransport({
      accessKeyID: "AKIAJ2JWUZM6NLOJVC4Q",        // AWS Access key ID を設定
      secretAccessKey: "Aj2Zvw7jAVAcdn8ZeaGWWh5jiXqz8rdxkhTwuiylyauz",            // AWS Secret access key を設定
  }));


  // NB! No need to recreate the transporter object. You can use
  // the same transporter object for all e-mails

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: 'ateji support <info@ateji.jp>', // sender address
    to: 'icymasa@gmail.com', // list of receivers
    subject: 'Hello', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Hello world</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){

      console.log(error);

      res.render("auth/emailtest", {data:{
        postrequest: "failed",
        error:error,
      }});

    }else{

      console.log('Message sent: ' + info.response);
      
      res.render("auth/emailtest", {data:{
        postrequest:info.response,
        
      }});

    }
  });


});





router.get('/facebook/callback',
    passport.authenticate('facebook',{
      successRedirect: '/mypage',
      failureRedirect: '/',
    }));

router.get('/facebook/login',
    passport.authenticate('facebook',{scope:['email']}));

module.exports = router;
