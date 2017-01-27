var express = require('express');
var payment_router = module.exports = express.Router();


//mongoose
//
var _ = require("underscore");

var co = require("co");


var stripe_public_key;
var stripe_secret_key;

payment_router.setKeys = function(app){
  var payment_settings = require("../payment/settings.json");
  if (app.get('env') === 'development') {
    stripe_public_key = payment_settings.test.public_key;
    stripe_secret_key = payment_settings.test.secret_key;
  }
  else{
    stripe_public_key = payment_settings.live.public_key;
    stripe_secret_key = payment_settings.live.secret_key;
  }
}



payment_router.get("/",(req,res,next)=>{
  if(!stripe_public_key){
    next(new Error("no key set"));
  }

  res.render("payment",{
    stripe_public_key
  });
});


payment_router.post("/",(req,res,next)=>{
  if(!stripe_public_key){
    next(new Error("no key set"));
  }

  var stripe = require("stripe")(stripe_secret_key);

  // Token is created using Stripe.js or Checkout!
  // Get the payment token submitted by the form:
  var token = req.body.stripeToken; // Using Express

  // Charge the user's card:
  var charge = stripe.charges.create({
    description: "Shoko さんお支払い",
    currency:'jpy',
    amount: 60000,
    source: token,
  }, function(err, charge) {

    if(err){

      res.render("payment_done", {err});
      return ;
    }

    res.render("payment_done", {charge});

  });


});
