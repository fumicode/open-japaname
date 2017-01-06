var express = require('express');
var co = require("co");
var _ = require('underscore');
var names_router = module.exports =  express.Router();
var path = require("path");
var atejilib = require('../core/atejilib.js');
var cookie   = require('cookie');

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Japaname = mongoose.model("Japaname");


var authModule = require("../auth/authModule.js");
var loginCheck = authModule.loginCheck;

var artworks = require("../models/artworks.js");




names_router.get('/', function(req, res, next){//?original_name=james を想定
  var name_db = atejilib.getNames();

  res.render("names/index", {name_db})

});


names_router.get("/:japaname_id([0-9\-]+)", function(req, res, next){
  co(function*(){
    var japaname_id = Japaname.japanameDecode(req.params.japaname_id);


    try{
      var japaname = yield Japaname.findById(japaname_id)
        .populate("names.ateji").populate("names.kana").exec();

      if(!japaname){
        return next();
      }
    }
    catch(err){
      return next(err);
    }


    var artworks_list = artworks.getList(); 

    res.render("names/name", {
      japaname,
      artworks:artworks_list,
    })
  }).catch((err)=>{
    next(err);
  });
});


names_router.post('/', function(req, res, next) {
  co(function*(){
    //美しくないなあ。それだったらbodyそのものをjsonにすればいいじゃん
    //何か理由があったんだっけ？クライアントサイドがつくりにくいとか
    //かえたい。 20161212
    //依存してるのは、names/candidatesと
    //crafti/japaname_frame.あとでかえる。
    //atejiってのも、atemojisが正確な表現

    //var original_name = req.body.original_name;
    //var ateji         = JSON.parse(req.body.ateji_json);
    var names = JSON.parse(req.body.names);

    var newJapaname = yield Japaname.createNew(names);
    var url_id = Japaname.japanameEncode(newJapaname._id);

    //超危険！ どこからでもアクセスを許しちゃう。
    //res.set("Access-Control-Allow-Origin","*");
    res.redirect(/*req.baseUrl +*/ "/" + url_id); //短縮URL
  }).catch((err)=>{
    return next(err);
  });
});

names_router.get('/candidates/', function(req, res, next){//?original_name=james を想定
  var original_name = req.query.original_name;
  //名前が空だったらtopにリダイレクト
  if(!original_name){
    return res.redirect("/");
  }

  //数字が入力されたらidだと思って結果ページにそのままいく
  if(Japaname.isJapanameCode(original_name)){
    var japaname_code = original_name;

    japaname_code = Japaname.japanameEncode(Japaname.japanameDecode(japaname_code));

    res.redirect("/" + japaname_code);

    return;
  }

  res.redirect(req.baseUrl + "/candidates/" + encodeURIComponent(original_name));
});


function isNumber(num_str){
  return !! num_str.match(/^\d+$/);
}

names_router.get('/candidates/:original_name', function(req, res, next) {
  co(function*(){
    var original_name = req.params.original_name;
    //名前が空だったらtopにリダイレクト
    if(!original_name){
      res.redirect("/");
      return;
    }

    var original_names = original_name.split(/[ ,　,\,,\|,\\,\/]+/);
    var nullify = err => Promise.resolve(null); 
    var translated_names = yield _(original_names).map(function(original_name){
      return atejilib.toJapaneseSound(original_name).catch(nullify);
    });

    var succeeded_names = _(translated_names).filter(a=>a); //falseになるもの(null)は排除される
    if(succeeded_names.length < 1){
      return res.render("japaname_not_found", {original_name});
    }


    var name_objs = _(succeeded_names).map(function(name_obj,index){
      var original_name = name_obj.original_name;
      var hiragana      = name_obj.hiragana;
      var katakana      = name_obj.katakana;
      var hiragana_nosmall = atejilib.hiraganaToNosmall(hiragana);

      //ローマ字 ほんとはこんなに単純じゃないけど
      var romajis_array = _(hiragana_nosmall).map(atejilib.hiraganasToRomajis);
      console.log(hiragana);
      console.log(hiragana);
      var obj = atejilib.atejiSyllables(hiragana);
      var syllables = obj.syllables;
      atejilib.addMeaningToSyllables(syllables);

      return {
        original_name,
        hiragana,
        katakana,
        hiragana_nosmall,
        syllables,
      };
    });

    res.render("names/candidate",{
      original_name:_(name_objs).map(name_obj => name_obj.original_name).join(" "),
      name_objs,
    });

  }).catch(err=> next(err));

});











