var express = require('express');
var thumbnail_router = module.exports = express.Router();
var fs = require("fs");


var mongoose = require("mongoose");
var Japaname = mongoose.model("Japaname");

//mongoose
//
var _ = require("underscore");

var co = require("co");

var ejs = require("ejs");
var path = require("path");

//var Rsvg = require("librsvg").Rsvg;



thumbnail_router.get("/:name",(req,res,next)=>{
  var name = req.params.name;

  res.render("thumbnail", {name});
});


//direct svg rendering by ejs
thumbnail_router.get("/svg/:japaname_code",(req,res,next)=>{
  co(function*(){
    if(! Japaname.isJapanameCode(req.params.japaname_code) ){
      return next();
    }

    var japaname_code = req.params.japaname_code;

    var japaname = yield Japaname.findByCode(japaname_code)
      .populate("names.ateji").populate("names.kana").exec()

    if(!japaname){
      return next();
    }


    res.setHeader('Content-Type', 'image/svg+xml');
    res.render("risumaru_ume.ejs", {japaname});

  }).catch((err)=>{
    next(err);
  });
});


//direct svg rendering by ejs
thumbnail_router.get("/png/:japaname_code",(req,res,next)=>{
  co(function*(){
    if(! Japaname.isJapanameCode(req.params.japaname_code) ){
      return next();
    }

    var japaname_code = req.params.japaname_code;

    var japaname = yield Japaname.findByCode(japaname_code)
      .populate("names.ateji").populate("names.kana").exec()

    if(!japaname){
      return next();
    }

    var pngdata = yield ejs2svg2png(
      path.join(__dirname, "../views/risumaru_ume.ejs"), japaname);

    res.setHeader('Content-Type', 'image/png');
    res.send(pngdata);
  }).catch((err)=>{
    next(err);
  });
});


function ejs2svg2png(ejspath, japaname){
  return new Promise((resolve,reject)=>{
    ejs.renderFile(ejspath, {japaname},
      {}, function(err, str){

      var svg = new Rsvg();
      svg.write(str);

      svg.end(function(){
        resolve(svg.render({
            format: 'png',
            width: svg.width*4,
            height: svg.height*4
        }).data);
      });
    });
  });
}



thumbnail_router.get("/server/:name",(req,res,next)=>{
  var name = req.params.name;
  console.log("name " + name);

  var Canvas = require('canvas')
    , Image = Canvas.Image
    , Font = Canvas.Font
    , canvas = new Canvas(500, 500);

  //way of https://github.com/chearon/node-canvas#prefer-pango !!
  //different from original!!! 
  //Canvas.registerFont(
  //    __dirname + '../core/image/honoka-min/font_1_honokamin.ttf'
  //);
  

  var compositeIconName = require("../core/image/imageProcessing").compositeIconName;


  fs.readFile(__dirname + '/../public/images/thumbnail-image.jpg', function(err, squid){

    if (err) throw err;
      img = new Image;

    img.src = squid;

    console.log("canvas.font" , Font);

    compositeIconName(canvas, img, name, Canvas.Font);

    var dataurl = canvas.toDataURL();

    res.render("thumbnail_server", {dataurl});
  });

});
