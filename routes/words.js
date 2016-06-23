var express = require('express');
var words_router = express.Router();
var mongoose = require("mongoose");
var Word = mongoose.model("Word");
var _ = require("underscore");
var atejilib = require("../core/atejilib");

var authModule = require("../authentication/authModule.js");

var convertLinesToArray = require('../util/router_helper').convertLinesToArray;

var co = require("co");

/* GET users listing. */

module.exports = words_router;

words_router.get('/', function(req, res, next) {

  Word.find()
  .then(function(words){
    words.sort();
    res.render("words", {words:words});
  });
});


words_router.get('/add_word', authModule.authorize("kanji-edit"),function(req, res, next) {
  res.render("words/add_word");
});


function addWord (word,meanings_text,sounds_text){
  
  var meanings = convertLinesToArray(meanings_text);
  var sounds = convertLinesToArray(sounds_text); 

  meanings = checkMeaningsArray(meanings);
  sounds = checkSoundsArray(sounds); 

  var new_word = new Word({_id:word, meanings,sounds});
  return new_word.save();
}


//漢字を追加
words_router.post('/',authModule.authorize("kanji-edit"), function(req, res, next) {
  var word = req.body.word;
  var meanings_text = req.body.meanings;
  var sounds_text = req.body.sounds;

  //
  //


  //まずみつけようとする。
  Word.findById(word).exec()
  .then(function(word_obj){
    if(word_obj){
      //あったら、その漢字のページに飛ばす ありましたと表示
      //flash
      
      req.flash("info", "すでに漢字が登録されていました。以下のような内容でよければ登録ボタンを押して編集を完了してください。");

      var meanings = convertLinesToArray(meanings_text);
      var sounds = convertLinesToArray(sounds_text); 

      meanings = checkMeaningsArray(meanings);
      sounds = checkSoundsArray(sounds); 

      res.redirect(encodeURIComponent(word_obj._id) + "?add_sounds="+_.map(sounds,encodeURIComponent).join(",")+"&add_meanings="+meanings.join(","));
    }
    else{
      //なかったら、追加OK
      return addWord(word,meanings_text,sounds_text);
    }
  },function(err){
    //なかったら、追加OK
    return addWord(word,meanings_text,sounds_text);
  })
  .then(function(doc){
    console.log("saved");
    console.log(doc);
    req.flash("info", "漢字の登録が完了しました。ご協力ありがとうございます！");
    res.redirect(encodeURIComponent(word));
  })
  .catch(function(err){
    console.log("update error");
    console.log(err);

    err.respondError ("couldn't edit word",err);

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
words_router.get('/:word', function(req, res, next) {
  var word = req.params.word;
  var adding_meanings = req.query.add_meanings;
  var adding_sounds = req.query.add_sounds;

  adding_meanings = (adding_meanings && adding_meanings.split(',')) || [];
  adding_sounds = (adding_sounds && adding_sounds.split(',')) || [];

  console.log("hoge");
  co(function*(){
    var wordobj = yield Word.findById(word).exec();

    if(wordobj){
      console.log(wordobj);
      
      res.render("words/word",{
        word:wordobj._id,
        meanings:(wordobj.meanings || []).concat(adding_meanings),
        sounds:(wordobj.sounds || []).concat(adding_sounds),
        used_kanjis: wordobj._id.split(""),
        romaji_sounds:wordobj.romaji_sounds,
      });
    }
    else{
      next();
    }

  }).catch(function(err){
    next(err);
  });

});


words_router.post('/:word',authModule.authorize("kanji-edit"), function(req, res, next) {
  var word = req.params.word;
  var sounds = req.body.sounds;
  var meanings= req.body.meanings;

  console.log(word);
  console.log(sounds);
  console.log(meanings);

  upsertWord(word,meanings,sounds)
    .then(function(doc){
      console.log("updated");
      console.log(doc);

      req.flash("info", "漢字の登録が完了しました。ご協力ありがとうございます！");
      res.redirect(encodeURIComponent( word));
    })
    .catch(function(err){
      console.log("update error");
      console.log(err);

      res.respondError ("couldn't edit word",err);

    });
});

function upsertWord(word,meaningsText,soundsText){
  var sounds = convertLinesToArray(soundsText); 
  var meanings = convertLinesToArray(meaningsText);

  sounds = checkSoundsArray(sounds); 
  meanings = checkMeaningsArray(meanings);


  //これをDBに登録
  console.log("updating");
  return Word.update({_id:word}, {sounds,meanings},{upsert:true});
  //すでに登録されている場合は、上書き保存
  //
}



