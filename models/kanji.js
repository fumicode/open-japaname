var mongoose = require('mongoose');
var _us = require("underscore");
var Schema = mongoose.Schema;
var atejilib = require("../core/atejilib.js");

///////////////////////////////////////////////////////////////
//                        Kanji Schema
///////////////////////////////////////////////////////////////

var KanjiSchema = new mongoose.Schema({
  _id:    String, //漢字そのもの
  sounds: [String], //ひらがなで音 
  meanings:[String], //英単語の列
  meanings_fr:[String], //払単語の列
  include_words:[String],
  additionals:Schema.Types.Mixed, //いろいろつけたせるようにする
});



KanjiSchema.post("update", function(doc){
  console.log("post update");
  atejilib.loadKanjiDB();//一分だけ更新とかできたらいいんだけど。
});

KanjiSchema.post("save", function(doc){
  console.log("post save");
  atejilib.loadKanjiDB();//一分だけ更新とかできたらいいんだけど。

});


KanjiSchema.virtual('romaji_sounds').get(function () {
  console.log("romaji--");
  return _us.map(this.sounds, function(sound){
    try{
      return atejilib.hiraganaToRomaji(sound);
    }catch(err){
      return "";
    }
  });
});

module.exports = KanjiSchema;
