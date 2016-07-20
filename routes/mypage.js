var express = require('express');
var mypage_router = module.exports = express.Router();
var atejilib= require('../core/atejilib');
var _ = require('underscore');

var co = require("co");


// load up the user model
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Ateji = mongoose.model("Ateji");

var Purchase = mongoose.model("Purchase");


mypage_router.get('/', function(req, res, next) {
  co(function*(){
    var purchases = yield Purchase.find({buyer:req.user._id})
      .populate("japaname").exec();

    yield req.user
      .populate({
        path:"my_japaname", 
        populate:{
          path:"names.ateji names.kana"
        }
      })
      .execPopulate();

    res.render("mypage", {purchases});
  }).catch((err)=>{
    next(err);
  });
});

mypage_router.route("/japaname").get(function(req, res, next) {
  if(req.user.japaname){
    res.redirect("/" + req.user.japaname._id);
  }
}).post(function(req, res, next) {
  co(function*(){
    var old_ateji = req.user.ateji_id; //populated
    var ateji_id = req.body.ateji_id;

    var ateji_obj = yield Ateji.findById(ateji_id).exec();

    if(ateji_obj){
      req.user.ateji_id = ateji_obj._id;
      req.user.save()
      .then(function(user){
        req.flash("info", "Changed your Ateji from "+old_ateji.ateji_name+" to "+ateji_obj.ateji_name+"!" );
        res.redirect("/mypage");
      });
    }
    else{
      req.flash("info", "Ateji " + ateji_id + " was not found");
      res.redirect("/mypage");
    }
  }).catch(function(err){
    next(err);
  });
});


mypage_router.get('/payment_info', function(req, res, next) {
  if(req.user.webpay_cus_code){
    console.log("user has cus code " + req.user.webpay_cus_code);

    webpay.customer.retrieve({
      id:req.user.webpay_cus_code,
    },function(err, response){
      if(err){
        res.respondError("webpay customer retrieve error", err);
        return;
      }
      if(res){
        res.render( "mypage/payment_info", {
          webpay_response:response,
          redirect_url: req.query.redirect_url,
          webpay_public_key:webpay.getPublicKey()
        });
        return;
      }
      else{
        res.respondError("webpay customer retrieve error", {});
        return;
      }

    });
  }
  else{
    res.render( "mypage/payment_info", { 
      redirect_url: req.query.redirect_url,
      webpay_public_key:webpay.getPublicKey()
    });
  }

});

mypage_router.post('/payment_info', function(req, res, next) {

  var webpay_token = req.body.webpay_token;
  var redirect_url = req.body.redirect_url || req.query.redirect_url ;

  console.log(redirect_url);

  if(!webpay_token){

    if(req.user.webpay_cus_code){
      success();
      return;
    }

    res.render("mypage/payment_info");

    return;
  }

  var success = function(){
    console.log("redirect url--------------------" );
    console.log(req.body);

    console.log(redirect_url);
    if(redirect_url){
      console.log(redirect_url);

      res.redirect(redirect_url);
      return ;
    }

    res.redirect("/mypage/payment_info");
  };

  if(req.user.webpay_cus_code){
    console.log("user has cus code " + req.user.webpay_cus_code);

    webpay.customer.update({
      id: req.user.webpay_cus_code,
      card:webpay_token
    },function(err, response){

      if(err){
        res.respondError("webpay error ", err);
        return;
      }

      console.log("updated user info" + response);
      success();
    });
  }
  else{
    webpay.customer.create({
      card: webpay_token,
      description: "user id " + req.user._id
    }, function(err, response) {
      req.user.webpay_cus_code = response.id;

      console.log("user has no cus code. made:" +response);

      req.user.save(function(err, user){
        if(err){
          resnpondError("couldn't save usr", err,res);
          return;
        }

        console.log("user save" +user);

        if(user){
          success();
        }
        else{
          resnpondError("couldn't save usr", {},res);
          return;
        }
      });
    });
  }
});

mypage_router.get('/user_info', function(req, res, next) {
  res.render("mypage/user_info",{data:"user_info"});
});


mypage_router.post('/user_info/email', function(req, res, next) {

  req.assert("email","Invalid Email. Please check the format.").notEmpty(true).isEmail();

  var errors = req.validationErrors();

  if (errors && errors.length > 0) {
    console.log("errors");
    console.log(errors);

    req.flash("info", "We couldn't change the email address.(format error)");
    res.redirect("/mypage/user_info");
    return;
  }

  if(req.body.email == req.body.confirm_email){
    req.user.userinfo.email = req.body.email;
    req.user.save(function(){
      req.flash("info", "You have changed email");
      res.redirect("/mypage/user_info");
    });
    
    return;
  }
  else{
    req.flash("info", "Enter same email address twice.");
    res.redirect("/mypage/user_info");
    return;
  }

});

mypage_router.post('/user_info/password', function(req, res, next) {

  //OK current_passwordが正しくて
  //OK passwordがvalidで、
  //confirm_passwordとあっていたら、
  //userに登録

  var current_password = req.body.current_password;
  var password = req.body.password;
  var confirm_password = req.body.confirm_password;

  console.log(current_password );
  console.log(password );
  console.log(confirm_password );

  //passwordがvalidで、
  req.check('password','Invalid Password. Password should not be empty'+
        ' and the length should be 6-20.').isLength(6,20);
  //文字種制限もしないとね
  //
  var errors = req.validationErrors();

  console.log(5);
  if (errors && errors.length > 0) {
    console.log("errors");
    console.log(errors);

    req.flash("info", "The format of password is 6-20 string.");
    res.redirect("/mypage/user_info");
    return;
  }

  //current_passwordが正しくて
  //*

  console.log(4);
  if(!req.user.passwordIsCorrect(current_password)){
    req.flash("info", "Given password is wrong.");
    res.redirect("/mypage/user_info");
    return;
  }
  //*/

  console.log(3);
  if( password != confirm_password){

    req.flash("info", "Enter same password address twice.");
    res.redirect("/mypage/user_info");
  }

  console.log(2);
  req.user.setPassword(password);

  console.log(1);
  req.user.save().then((user)=>{
    req.flash("info", "You have changed password");
    res.redirect("/mypage/user_info");
  }, function(err){
    req.flash("info", "Couldn't change the password");
    res.redirect("/mypage/user_info");
  });

});




