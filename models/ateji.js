var atejilib = require("../core/atejilib.js");
var mongoose = require('mongoose');
var _ = require("underscore");

///////////////////////////////////////////////////////////////
//                        Ateji Schema
///////////////////////////////////////////////////////////////

var AtejiSchema = module.exports = new mongoose.Schema({
  _id:Number,
    //9桁の数字
  original_name:String,
  atejis:[{
    kana: String,
    kanji: String,
  }]
});


AtejiSchema.virtual('ateji_name').get(function () {
  var this_ateji = this;
  
  var reduced = _.reduce(this_ateji.atejis, function(memo,obj){
    memo += obj.kanji;
    return memo;
  },"");

  return reduced; 
});


AtejiSchema.virtual('furigana').get(function () {
  var this_ateji = this;
  
  var reduced = _.reduce(this_ateji.atejis, function(memo,obj){
    memo += obj.kana;
    return memo;
  },"");

  return reduced; 
});


//カタカナとしてどう読むかもほしいよね。


AtejiSchema.virtual('atejis_populated').get(function () {
  var this_ateji = this;
  var populated = [];

  _(this_ateji.atejis).each(function(ateji){
    ateji.meanings = atejilib.meaningsOfKanji(ateji.kanji).meanings; 
    ateji.romaji_kana = atejilib.hiraganaToRomaji(ateji.kana);
  });

  return this_ateji.atejis;
});



//id をふる仕組みを


/* 下記を参考に。
KanjiSchema.post("update", function(doc){
  console.log("post update");
  atejilib.loadKanjiDB();//一分だけ更新とかできたらいいんだけど。
});

KanjiSchema.post("save", function(doc){
  console.log("post save");
  atejilib.loadKanjiDB();//一分だけ更新とかできたらいいんだけど。

});

*/
