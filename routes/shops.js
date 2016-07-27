var express = require('express');
var shops_router = module.exports = express.Router();

//mongoose
var _ = require("underscore");
var co = require("co");
var path = require("path");

var mongoose = require("mongoose");
var Japaname = mongoose.model("Japaname");
var Artwork = require("../models/artworks.js");

shops_router.get("/:shopname/",(req,res,next)=>{
  co(function*(){
    var shopname = req.params.shopname;
    var japaname_code = req.query.japaname;


    if(japaname_code && Japaname.isJapanameCode(japaname_code)){
      var japaname = yield Japaname.findByCode(japaname_code).exec();
    }

    var artworks = Artwork.getList();

    var arton_artwork = _(artworks).filter(
      (a)=>a.artwork_name != "risumaru_ofuda");


    if(shopname !== "arton"){  //haveRight = authModule.authorize("arton")
      return next();//not found
    }

    res.render("shops/shop-arton",{
      artworks:arton_artwork,
      japaname
    });
  }).catch((err)=>{
    return next(err);
  });
});


