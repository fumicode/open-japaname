var express = require('express');
var purchases_router = module.exports = express.Router();

var _ = require("underscore");
var co = require("co");
var mongoose = require("mongoose");
var Purchase = mongoose.model("Purchase");



purchases_router.get("/:artwork_name/:japaname_code",(req,res,next)=>{
  co(function*(){
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;


    ///////////////////////////validation///////////////////////////
    if(artwork_name !== "risumaru_ofuda"){
      next();
    }

    var japaname = yield Japaname.findByCode(japaname_code).exec();

    if(!japaname){
      next(); //not found
    }

    //check if puchase exists or not
    var purchase = yield Purchase
      .findOne({buyer:req.user._id, artwork_name, japaname_code}).exec();


    //purchase doesn't exist
    if(!purchase){
      return res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/preview");
    }


    //購入済
    return res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/");

  }).catch((err)=>{
    next(err)
  });
});


purchases_router.post("/:artwork_name/:japaname_code",(req,res,next)=>{
  console.log("purchase start");
  co(function*(){
    var artwork_name  = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;

    var purchase = yield Purchase
      .findOne({buyer:req.user._id, artwork_name, japaname_code}).exec();

    //すでに購入があったら
    if(purchase){
      var message = "you have already bought the item";

      console.log(message);
      req.flash("info", message);
      //購入済
      return res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/");
    }

    if(artwork_name !== "risumaru_ofuda"){
      next();
    }

    YAEHATA_PRICE = 300;

    //購入がなかったら、つくる
    var result = yield Purchase.createNew({
      buyer_id :req.user._id,
      price    : YAEHATA_PRICE,
      artwork_name ,
      japaname_code,
    })

    // !!!! result の中身を見る必要がある
    
    console.log("purchase completed");
    console.log(result);

    if(result){
      res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/");
    }
    else{
      next();
    }


  }).catch((err)=>{
    next(err)
  });
});
