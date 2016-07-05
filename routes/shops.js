var express = require('express');
var shops_router = module.exports = express.Router();

//mongoose
var _ = require("underscore");
var co = require("co");
var path = require("path");


var mongoose = require("mongoose");
var Japaname = mongoose.model("Japaname");
var Purchase = mongoose.model("Purchase");


shops_router.get("/:shopname/artworks/:artwork_name/:japaname_code",(req,res,next)=>{
  co(function*(){
    var shopname = req.params.shopname;
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;

    var artwork_width =  req.query.artwork_width || 50;

    if(shopname == "arton"){  //haveRight = authModule.authorize("arton")
      var ofuda = "risumaru_ofuda";

      if(artwork_name === ofuda){

        var japaname = yield Japaname.findByCode(japaname_code)
          .populate("names.ateji").populate("names.kana").exec();

        if(!japaname){
          return next(); //404
        }

        var purchaseExists = yield Purchase.doesExist({
          user_id:req.user._id,
          artwork_name:ofuda,
          japaname_id:japaname.id
        });
console.log("artwork");
console.log(artwork_width);

        if(purchaseExists){ //すでに購入していた
          return res.render("artworks/" + artwork_name, {japaname, artwork_width});
        }
        else{
          return res.redirect(path.join(req.baseUrl , req.url , "/preview"));
        }
      }
      else{
        return next();//not found
      }
    }
    else{
      return next();//not found
    }

  }).catch((err)=>{
    return next(err);
  });
});


shops_router.get("/:shopname/artworks/:artwork_name/:japaname_code/preview",(req,res,next)=>{
  co(function*(){
    var shopname = req.params.shopname;
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;

    if(shopname == "arton"){  //haveRight = authModule.authorize("arton")
      var ofuda = "risumaru_ofuda";
      // var ino   = "risumaru_ino"; var shika = "risumaru_shika"; var chou  = "risumaru_chou"; 

      if(artwork_name === ofuda){

        var japaname = yield Japaname.findByCode(japaname_code)
          .populate("names.ateji").populate("names.kana").exec();

        if(!japaname){
          return next(); //404
        }

        var purchase = yield Purchase
          .findOne({ buyer:req.user._id, artwork_name:ofuda, japaname:japaname.id})
          .exec();

        console.log(purchase);

        if(purchase){ //すでに購入していた
          return res.redirect(path.join(req.baseUrl, req.url , "../"));
        }
        else{
          return res.render("artworks/" + ofuda, {japaname, preview:true});
        }
      }
      else{
        return next();//not found
      }
    }
    else{
      return next();//not found
    }
  }).catch((err)=>{
    return next(err);
  });
});


