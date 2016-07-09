var express = require('express');
var purchases_router = module.exports = express.Router();

var _ = require("underscore");
var co = require("co");
var mongoose = require("mongoose");
var Japaname = mongoose.model("Japaname");
var Purchase = mongoose.model("Purchase");

var artworks = require("../models/artworks.js");



purchases_router.get("/:artwork_name/:japaname_code",(req,res,next)=>{
  co(function*(){
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;


    ///////////////////////////validation///////////////////////////
    if(!artworks.doesExist(artwork_name)){
      return next();
    }

    var japaname = yield Japaname.findByCode(japaname_code).exec();

    if(!japaname){
      return next(); //not found
    }

    //check if puchase exists or not
    var purchaseExists = yield Purchase.doesExist({
      user_id:req.user._id,
      artwork_name,
      japaname:japaname.id
    })


    //購入してない場合、買ってね
    if(!purchaseExists){
      return res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/preview");
    }
    else{
      //購入してる場合、どうぞ
      return res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/");
    }

  }).catch((err)=>{
    return next(err)
  });
});



purchases_router.post("/:artwork_name/:japaname_code",(req,res,next)=>{
  co(function*(){
    var artwork_name  = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;

    if(!artworks.doesExist(artwork_name)){
      return next();
    }

    if(!Japaname.isJapanameCode(japaname_code)){
      return next();
    }

    //check if puchase exists or not
    var purchaseExists = yield Purchase.doesExist({
      user_id:req.user._id,
      artwork_name,
      japaname:Japaname.japanameDecode(japaname_code)
    });

    //すでに購入があったら
    if(purchaseExists){
      var message = "you have already bought the item";

      console.log(message);
      req.flash("info", message);
      //購入済
      return res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/");
    }

    YAEHATA_PRICE = 300;

    //購入がなかったら、つくる
    var result = yield Purchase.createNew({
      buyer_id :req.user._id,
      price    : YAEHATA_PRICE,
      artwork_name ,
      japaname:Japaname.japanameDecode(japaname_code),
    })

    //result の中身を見る必要がある
    console.log("purchase completed");
    console.log(JSON.stringify(result));

    if(result){
      return res.redirect("/shops/arton/artworks/"+artwork_name+"/"+japaname_code+"/");
    }
    else{
      return next();
    }

  }).catch((err)=>{
    return next(err)
  });
});


