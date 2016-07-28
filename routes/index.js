var express = require('express');

var _ = require("underscore");
var co = require("co");
var router = express.Router();

var mongoose = require("mongoose");
var Japaname = mongoose.model("Japaname");
var Artwork = require("../models/artworks.js");

/* GET home page. */
router.get('/', function(req, res, next) {

  co(function*(){
    var japaname = yield Japaname.findByCode(34).exec();

    var artworks = Artwork.getList();
    var arton_artwork = _(artworks).filter(
      (a)=>a.artwork_name != "risumaru_ofuda");

    res.render('index',{
      artworks:arton_artwork,
      japaname
    });

  }).catch((err)=>{
    return next(err);
  });


});




/* ateji short url */
router.get('/:japaname_id([0-9\-]+)', function(req, res, next) {
  var japaname_id = req.params.japaname_id;
  req.url =  "/names/" + japaname_id;
  return next();
});

module.exports = router;
