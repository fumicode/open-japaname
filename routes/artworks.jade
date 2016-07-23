var express = require('express');
var shops_router = module.exports = express.Router();

//mongoose
var _ = require("underscore");
var co = require("co");
var path = require("path");


var mongoose = require("mongoose");
var Japaname = mongoose.model("Japaname");
var Purchase = mongoose.model("Purchase");
var artworks = require("../models/artworks.js");

shops_router.get("/:shopname/artworks/:artwork_name/:japaname_code",(req,res,next)=>{
  co(function*(){
    var shopname = req.params.shopname;
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;

    var artwork_width =  req.query.artwork_width || 310;


    if(shopname !== "arton"){  //haveRight = authModule.authorize("arton")
      return next();//not found
    }

    try{
      var obj = yield obtainPurchaseObjects(artwork_name,japaname_code,req.user._id);

      if(obj.purchaseExists){ //すでに購入していた
        //ふつうにレンダリングする
        return res.render("artworks" , {
          japaname:obj.japaname, 
          artwork:obj.artwork,
          artwork_width,
          sizing:true});
      }
      else{
        return res.redirect(path.join(req.baseUrl, "/arton/artworks/"+ artwork_name +"/"+ japaname_code + "/preview"));
      }
    }
    catch(err){
      console.log(err);
      next();//not found
    }
  }).catch((err)=>{
    return next(err);
  });

});

shops_router.get("/:shopname/artworks/:artwork_name/:japaname_code/print",(req,res,next)=>{
  co(function*(){
    var shopname = req.params.shopname;
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;
    var artwork_width =  req.query.artwork_width || 310;

    if(shopname !== "arton"){  //haveRight = authModule.authorize("arton")
      return next();//not found
    }

    try{
      var obj = yield obtainPurchaseObjects(artwork_name,japaname_code,req.user._id);

      if(obj.purchaseExists){ //すでに購入していた
        return res.render("artworks" , {
          japaname: obj.japaname,
          artwork:obj.artwork,
          artwork_width,
          print:true});
      }
      else{
        return res.redirect(path.join(req.baseUrl, "arton/artworks/"+ artwork_name +"/"+ japaname_code + "/preview"));
      }
    }
    catch(err){
      next();//not found
    }
  }).catch((err)=>{
    return next(err);
  });
});



function obtainPurchaseObjects(artwork_name, japaname_code, user_id){
  return co(function*(){

    if(!artworks.doesExist(artwork_name)){
      throw new Error("artwork not found");//not round
    }

    var artwork = artworks.get(artwork_name);

    var japaname = yield Japaname.findByCode(japaname_code)
      .populate("names.ateji").populate("names.kana").exec();

    if(!japaname){
      throw new Error("japaname not found"); //404
    }

    var purchase = yield Purchase.doesExist({
      user_id:user_id,
      artwork_name:artwork.artwork_name,
      japaname:japaname_code
    });

    if(purchase){
      return{
        purchaseExists:true,
        artwork,
        japaname,
        purchase
      };
    }
    else{
      return{
        purchaseExists:false,
        artwork,
        japaname,
        purchase:null
      };
    }

  });
}


shops_router.get("/:shopname/artworks/:artwork_name/:japaname_code/preview",(req,res,next)=>{
  co(function*(){
    var shopname = req.params.shopname;
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;

    if(shopname !== "arton"){  //haveRight = authModule.authorize("arton")
      return next();//not round
    }

    try{
      var obj = yield obtainPurchaseObjects(artwork_name,japaname_code,req.user._id);

      if(obj.purchaseExists){ //すでに購入していた
        return res.redirect(path.join(req.baseUrl, "/arton/artworks/"+ artwork_name +"/"+ japaname_code));
      }
      else{
        return res.render("artworks" , {japaname:obj.japaname, preview:true, artwork:obj.artwork});
      }
    }
    catch(err){
      console.log(err)
      next();//notfound
    }
  }).catch((err)=>{
    return next(err);
  });
});


// ゆる～りゆるゆるせきゅりてぃ
shops_router.get("/:shopname/artworks/:artwork_name/:japaname_code/thumbnail",(req,res,next)=>{
  co(function*(){
    var shopname = req.params.shopname;
    var artwork_name = req.params.artwork_name;
    var japaname_code = req.params.japaname_code;

    if(shopname !== "arton"){  //haveRight = authModule.authorize("arton")
      return next();//not round
    }

    try{


      var artwork = artworks.get(artwork_name);

      

      var japaname = yield Japaname.findByCode(japaname_code)
        .populate("names.ateji").populate("names.kana").exec();


      res.setHeader('Content-Type', 'image/svg+xml');
      res.render("artworks.ejs/"+artwork.artwork_name+".ejs", {japaname,share_url:"http://japaname.jp/" + japaname.code});
    }
    catch(err){
      console.log(err)
      next();//notfound
    }

  }).catch((err)=>{
    return next(err);
  });

});

