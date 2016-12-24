var express = require('express');
var kanjis_router = express.Router();
var sounds = require("./kanji-sounds");
var mongoose = require("mongoose");
var Kanji = mongoose.model("Kanji");
var Word = mongoose.model("Word");
var _ = require("underscore");
var atejilib = require("../../core/atejilib");

var authModule = require("../../auth/authModule.js");
var convertLinesToArray = require('../../util/router_helper').convertLinesToArray;
var co = require("co");

/* GET users listing. */
module.exports = kanjis_router;


kanjis_router.use('/sounds', sounds);

kanjis_router.get('/', function(req, res, next) {
  Kanji.find()
  .then(function(kanjis){
    kanjis.sort();
    res.render("kanjis", {kanjis:kanjis});
  });
});


kanjis_router.get('/add_kanji', authModule.authorize("kanji-edit"),function(req, res, next) {
  res.render("kanjis/add_kanji");
});




//漢字を追加
kanjis_router.post('/',authModule.authorize("kanji-edit"), function(req, res, next) {
  var kanji = req.body.kanji;
  var meanings_text = req.body.meanings || "";
  var sounds_text = req.body.sounds || "";
  var include_words_text = req.body.include_words || "";

  //まずみつけようとする。
  Kanji.findById(kanji).exec()
  .then(function(kanji_obj){
    if(kanji_obj){
      //あったら、その漢字のページに飛ばす ありましたと表示
      //flash
      
      req.flash("alert", "すでに漢字が登録されていました。以下のような内容でよければ登録ボタンを押して編集を完了してください。");

      var meanings = convertLinesToArray(meanings_text);
      var sounds = convertLinesToArray(sounds_text); 
      var include_words = convertLinesToArray(include_words_text); 

      meanings = checkMeaningsArray(meanings);
      sounds = checkSoundsArray(sounds); 
      //sounds = checkSoundsArray(sounds);  本トにその字が含まれてるかちぇっくs　

      res.redirect(encodeURIComponent(kanji_obj._id) + "?add_sounds="+_.map(sounds,encodeURIComponent).join(",")+"&add_meanings="+meanings.join(","));
    }
    else{
      //なかったら、追加OK
      return upsertKanji(kanji,meanings_text,sounds_text,include_words_text);
    }
  },function(err){
    //なかったら、追加OK
    return upsertKanji(kanji,meanings_text,sounds_text,include_words_text);
  })
  .then(function(doc){
    console.log("saved");
    console.log(doc);
    req.flash("info", "漢字の登録が完了しました。ご協力ありがとうございます！");
    res.redirect(encodeURIComponent(kanji));

  })
  .catch(function(err){
     next(err);
  });

});


//ひらがなかどうかチェックしてそうじゃなかったら消す

function checkMeaningsArray(meanings){
  return _.reduce(meanings,function(memo, meaning){
    if(atejilib.isASCII(meaning)){
      memo.push(meaning);
    }
    else{
      //do nothing
      //アルファベットじゃないとだめですっていうメッセージ
    }
    return memo;
  },[]);
}

function checkSoundsArray(sounds){
  return _.reduce(sounds,function(memo, sound){
    if(atejilib.isHiraganas(sound)){
      memo.push(sound);
    }
    else{
      //do nothing
      //ひらがなじゃないとだめですっていうメッセージ
    }
    return memo;
  },[]);
}

//
kanjis_router.get('/:kanji', function(req, res, next) {
  var kanji = req.params.kanji;
  var adding_meanings = req.query.add_meanings;
  var adding_sounds = req.query.add_sounds;

  adding_meanings = (adding_meanings && adding_meanings.split(',')) || [];
  adding_sounds = (adding_sounds && adding_sounds.split(',')) || [];

  console.log("hoge");

  co(function*(){
    var kanjiobj = yield Kanji.findById(kanji).exec();


    if(kanjiobj){
      var include_words = kanjiobj.include_words;

      console.log(kanjiobj);

      //word オブジェクトに変換する
      include_words = yield Word.find({_id:{$in:include_words}}).exec();

      console.log( include_words );

      res.render("kanjis/kanji",{
        kanji:kanjiobj._id,
        meanings:(kanjiobj.meanings || []).concat(adding_meanings),
        sounds:(kanjiobj.sounds || []).concat(adding_sounds),
        romaji_sounds:kanjiobj.romaji_sounds,
        include_words,
        _
      });
    }
    else{
      next(); //not found
    }
  }).catch(function(err){
    next(err);
  });

});


kanjis_router.post('/:kanji',authModule.authorize("kanji-edit"), function(req, res, next) {
  var kanji = req.params.kanji;
  var sounds = req.body.sounds || "";
  var meanings= req.body.meanings || "";
  var include_words = req.body.include_words || "";

  if(!kanji){
    res.redirect("/characters/kanjis/");
    return ;
  }

  console.log(kanji);
  console.log(sounds);
  console.log(meanings);
  console.log(include_words);

  upsertKanji(kanji,meanings,sounds,include_words)
    .then(function(doc){
      console.log("updated");
      console.log(doc);

      req.flash("info", "漢字の登録が完了しました。ご協力ありがとうございます！");
      res.redirect(encodeURIComponent( kanji));
    })
    .catch(function(err){
      console.log(err.stacktrace);
      next(err);
    });
});

function upsertKanji(kanji,meaningsText,soundsText, include_wordsText){
  var sounds = convertLinesToArray(soundsText); 
  var meanings = convertLinesToArray(meaningsText);
  var include_words = convertLinesToArray(include_wordsText);

  sounds = checkSoundsArray(sounds); 
  meanings = checkMeaningsArray(meanings);

  //これをDBに登録
  console.log("updating");
  return Kanji.update({_id:kanji}, {sounds, meanings, include_words}, {upsert:true});
}

