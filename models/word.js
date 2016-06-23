var mongoose = require('mongoose');
var _us = require("underscore");
var Schema = mongoose.Schema;
var atejilib = require("../core/atejilib.js");

///////////////////////////////////////////////////////////////
//                        Word Schema
///////////////////////////////////////////////////////////////

var WordSchema = new mongoose.Schema({
  _id:    String, //熟語そのもの
  sounds: [String], //ひらがなで音 ...romaji sound なるvirtualがあってもいいな
  meanings:[String], //英単語の列
  additionals:Schema.Types.Mixed, //いろいろつけたせるようにする
});

WordSchema.post("update", function(doc){
  console.log("post update");
});

WordSchema.post("save", function(doc){
  console.log("post save");
});


WordSchema.virtual('romaji_sounds').get(function () {
  console.log("romaji--");
  return _us.map(this.sounds, function(sound){
    try{
      return atejilib.hiraganaToRomaji(sound);
    }catch(err){
      return "";
    }
  });
});

module.exports = WordSchema;
