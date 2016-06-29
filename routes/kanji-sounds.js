var express = require('express');
var sounds_router = module.exports = express.Router();
var mongoose = require("mongoose");
var Kanji = mongoose.model("Kanji");

var atejilib = require("../core/atejilib");
var _ = require("underscore");

var authModule = require("../auth/authModule.js");

var convertLinesToArray = require('../util/router_helper').convertLinesToArray;

var co = require("co");

var addKanjisForSound= co.wrap(function*(adding_kanjis, sound){
  //音にあう漢字リスト
  var existing_kanjis_for_sound = yield Kanji.find({sounds:sound}).exec();

  //追加しようとしてる漢字リスト
  var existing_kanjis_for_adding = yield Kanji.find({
    _id:{$in:adding_kanjis}
  }).exec();

  //各漢字に実行したい関数を用意しておく。
  //出来上がったドキュメントと変更内容をくるんだPromise返す。
  var addKanjiForSound = function(adding_kanji,sound){
    var found_existing_kanji_for_sound 
      = _.find(existing_kanjis_for_sound, //一番最初の奴をかえしてくる
      (kanjiobj) => kanjiobj._id == adding_kanji);


    //すでに漢字があったら
    //=existing_kanjisに含まれていたら
    if(found_existing_kanji_for_sound){
      //何もしない
      return Promise.resolve({
        kanji:found_existing_kanji_for_sound,
        change:{} //nothing
      });
    }
    else{ //漢字がなかったら追加
      var found_existing_kanji_for_adding 
        = _.find(existing_kanjis_for_adding, //一番最初の奴をかえしてくる
        (kanjiobj) => kanjiobj._id == adding_kanji);

      //追加し酔うとしてる漢字が存在したら
      if(found_existing_kanji_for_adding){

        // 漢字に音を追加
        found_existing_kanji_for_adding.sounds.push(sound);
        found_existing_kanji_for_adding.sounds = _.uniq(found_existing_kanji_for_adding.sounds);

        return found_existing_kanji_for_adding.save().then(function(kanji_obj){
          return Promise.resolve({
            kanji:kanji_obj,
            change:{add_sound:sound}
          });
        });
      }
      else{
        console.log("追加しようとしている漢字"+adding_kanji+"は存在していなかった");
        //漢字がなかったら、素直に足す
        var newKanji = new Kanji({_id:adding_kanji,sounds:[sound],meanings:[]});
        return newKanji.save().then(function(kanji_obj){
          return Promise.resolve({
            kanji:kanji_obj,
            change:{add_kanji:adding_kanji, add_sound:sound}
          });
        });
      }
    }
  };

  var promises = _.map(adding_kanjis,function(adding_kanji){
    try{
    console.log("adding_kanji");
    var retval = addKanjiForSound(adding_kanji,sound);

    console.log("retval");
    console.log(retval);
    return retval;
    }catch(err){
      console.log(err);
    }

  });
  console.log("promises");
  console.log(promises);

  return yield promises;

});



sounds_router.get('/', function(req, res, next) {

  var sounds = atejilib.getAtejimap();
  sounds = _.map(sounds,function(kanjis,sound){
    return {
      sound,
      romaji_sound:atejilib.hiraganaToRomaji(sound),
      kanjis,
    };
  });
  res.render("kanjis/sounds/index",{sounds:sounds});
});

sounds_router.post('/',authModule.authorize("kanji-edit"), function(req, res, next) {
  console.log("post sound");

  var sound = req.body.sound;
  var kanjis_text = req.body.kanjis;
  
  //kanjisは分解
  var adding_kanjis = convertLinesToArray(kanjis_text);

  addKanjisForSound(adding_kanjis, sound)
  .then(function(kanjis_changes){

    req.flash("info","音「"+sound+"」に対する漢字を登録,編集しました");
    res.render("kanjis/add_result" ,{
      sound,
      kanjis_changes
    });
  },function(err){
    console.log("err");
    console.log(err);
  });
});

sounds_router.get('/add_sound', authModule.authorize("kanji-edit"),function(req, res, next) {
  res.render("kanjis/sounds/add_sound");
});

sounds_router.get('/:sound', function(req, res, next) {
  var sound = req.params.sound;
  co(function*(){
    var kanjis = yield Kanji.find({sounds:sound}).exec();
    res.render("kanjis/sounds/sound",{
      sound,
      romaji_sound:atejilib.hiraganaToRomaji(sound),
      kanjis
      //todo atejilib読む
    });
  });
});

sounds_router.post('/:sound',authModule.authorize("kanji-edit"), function(req, res, next) {
  var sound  = req.params.sound;
  var kanjis_text = req.body.kanjis;

  //kanjisは分解
  var adding_kanjis = convertLinesToArray(kanjis_text);

  addKanjisForSound(adding_kanjis, sound)
  .then(function(kanjis_changes){
    req.flash("info","音「"+sound+"」に対する漢字を登録,編集しました");
    res.render("kanjis/add_result" ,{
      sound,
      kanjis_changes
    });
  },function(err){
    console.log("err");
    console.log(err);

  });
  
});


