var atejilib = require("../core/atejilib.js");
var mongoose = require('mongoose');
var _ = require("underscore");

var co = require("co");

///////////////////////////////////////////////////////////////
//                        Ateji Schema
///////////////////////////////////////////////////////////////

var AtemojiSchema = new mongoose.Schema({
  kana: String,
  kanji: String,
  comment: String,
},{
  _id:false
});


var AtejiSchema = module.exports = new mongoose.Schema({
  //_id : ObjectId //あてもじsのハッシュ値にするワンチャンある。いまんとこはいいか
  
  atemojis:[AtemojiSchema]
},{
  //オブジェクトやJSONに変換するときに、virtualも変換するように設定
  toObject:{
    virtuals:true,
  },
  toJSON:{
    virtuals:true,
  }
});

AtejiSchema.methods.hasComment = function(){
  //!!!!
  var has = _(this.atemojis).reduce((memo, atemoji)=>{
    return memo || !!atemoji.comment;

  },false );

  console.log("ateji has comment ? " + has);

  return !!has;
}

AtejiSchema.virtual('string').get(function () {
  var this_ateji = this;

  var reduced = _(this_ateji.atemojis).reduce(function(memo,obj){
    memo += obj.kanji;
    return memo;
  },"");

  return reduced; 
});


AtejiSchema.virtual('furigana').get(function () {
  var this_ateji = this;
  
  var reduced = _(this_ateji.atemojis).reduce(function(memo,obj){
    memo += obj.kana;
    return memo;
  },"");

  return reduced; 
});


//カタカナとしてどう読むかもほしいよね。
AtejiSchema.virtual('populated_atemojis').get(function () {
  var this_ateji = this;

  var populated_atemojis = _(this_ateji.atemojis).map(function(atemoji){
    return {
      kanji: atemoji.kanji,
      kana:  atemoji.kana,
      comment: atemoji.comment,  
      meanings:atejilib.meaningsOfKanji(atemoji.kanji).meanings,
      romaji_kana:atejilib.hiraganaToRomaji(atemoji.kana)
    }
  });

  return populated_atemojis;
});


AtejiSchema.statics.createNew = function(atemojis){
  var Ateji = this;
  return co(function*(){
    
    atemojis = _(atemojis).reject(function(atemoji){
      //かなや漢字がないやつは拒否する。

      return !atemoji.kana || !atemoji.kanji

    }).map(function(atemoji){

      //カタカナはひらがなにへんかんする!!
      if(atejilib.isKatakanas(atemoji.kana)){
        atemoji.kana = atejilib.katakanasToHiraganas(atemoji.kana)
      }
      return atemoji;
    });


    //!!!! atemojis のバリデーション
    var newAteji = new Ateji({atemojis});

    return newAteji.save();
  });
}

