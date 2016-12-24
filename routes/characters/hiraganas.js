var express = require('express');
var hiraganas_router = module.exports = express.Router();


//mongoose
//
var _ = require("underscore");

var co = require("co");
var atejilib = require("../../core/atejilib");


var vowels = [
  "a",
  "i",
  "u",
  "e",
  "o"
];

var consonants = [
  "a",
  "k",
  "s",
  "t",
  "n",
  "h",
  "m",
  "y",
  "r",
  "w",
];


hiraganas_router.get("/",(req,res,next)=>{
  var hiraganasTable = atejilib.getHiraganasTable();
  //例外的処理
  hiraganasTable["w"] = ["わ",null,null,null,"を"];
  hiraganasTable["y"] = ["や",null,"ゆ",null,"よ"];

  console.log(hiraganasTable);
  res.render("characters/hiraganas", {vowels, consonants, hiraganasTable});
});


hiraganas_router.get("/:kana",(req,res,next)=>{
  var kana = req.params.kana;

  if(!atejilib.isHiragana(kana)) {
    return next();
  }

  res.render("characters/hiraganas/hiragana",{kana,vowel:"a", consonant:"a"});


});



