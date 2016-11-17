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

console.log("artworks");
console.log(artworks);


names_router.get("/:japaname_id([0-9\-]+)", function(req, res, next){
  co(function*(){
    var japaname_id = Japaname.japanameDecode(req.params.japaname_id);

    console.log("trying to find japaname" + japaname_id);

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
    console.log(artworks);
    console.log(artworks_list);

    res.render("atejis/selected", {
      japaname,
      artworks:artworks_list,
    });

  }).catch((err)=>{
    next(err);
  });
});


names_router.post('/', function(req, res, next) {
  co(function*(){
    var original_name = req.body.original_name;
    var ateji = JSON.parse(req.body.ateji);

    console.log(ateji); //JSON [{kana,kanji,sylindex}]
    var newJapaname = yield Japaname.createNew([{original:original_name, ateji}]);
    var url_id = Japaname.japanameEncode(newJapaname._id);

    res.redirect(/*req.baseUrl +*/ "/" + url_id); //短縮URL
  }) .catch((err)=>{
    return next(err);
  });

});


names_router.get('/candidates/', function(req, res, next){//?original_name=james を想定
  var original_name = req.query.original_name;
  //名前が空だったらtopにリダイレクト
  if(!original_name){
    res.redirect("/");
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

//↑のコピペ中尉!!!!
names_router.get('/api/', function(req, res, next){//?original_name=james を想定
  var original_name = req.query.original_name;
  //名前が空だったらtopにリダイレクト
  
  if(!original_name){

    return res.render("api",{
      original_name,
      name_objs
    });
  }

  res.redirect(req.baseUrl + "/api/" + encodeURIComponent(original_name));
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

    console.log(succeeded_names);

    var name_objs = _(succeeded_names).map(function(name_obj,index){
      name_obj.hiragana_nosmall = atejilib.hiraganaToNosmall(name_obj.hiragana);

      //ローマ字
      name_obj.romajis_array = _(name_obj.hiragana_nosmall).map(atejilib.hiraganasToRomajis);
      

      var obj = atejilib.atejiSyllables(name_obj.hiragana);
      // obj =   length syllables hiragana_str_nosmall
    
      var syllables = obj.syllables;


      atejilib.addMeaningToSyllables(syllables);

      //テーブルをつくる
      name_obj.syllables_table = atejilib.arrangeSyllablesTable(syllables, obj.length);

      return name_obj;
    });

    res.render("atejis/candidates",{
      original_name,
      name_objs
    });

  })
  .catch(function(err){
    next(err);
  });

});


//candidates とほとんど同じ
names_router.get('/api/:original_name', function(req, res, next) {

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

    console.log(succeeded_names);

    var name_objs = _(succeeded_names).map(function(name_obj,index){
      name_obj.hiragana_nosmall = atejilib.hiraganaToNosmall(name_obj.hiragana);

      //ローマ字
      name_obj.romajis_array = _(name_obj.hiragana_nosmall).map(atejilib.hiraganasToRomajis);
      

      var obj = atejilib.atejiSyllables(name_obj.hiragana);
      // obj =   length syllables hiragana_str_nosmall
    
      var syllables = name_obj.syllables = obj.syllables;

      atejilib.addMeaningToSyllables(syllables);

      //テーブルをつくる
      name_obj.syllables_table = atejilib.arrangeSyllablesTable(syllables, obj.length);

      return name_obj;
    });

    res.render("api",{
      original_name,
      name_objs
    });

  })
  .catch(function(err){
    next(err);
  });
});

names_router.get('/api_test/:original_name', function(req, res, next) {
  var original_name = req.params.original_name;
  //名前が空だったらtopにリダイレクト
  if(!original_name){
    return next(new Error("input name"));
  }

  var original_names = original_name.split(/[ ,　,\,,\|,\\,\/]+/);
  var original_name = original_names[0];

  res.render("api/test",{
    original_name
  });
});




//returns {chars: [{kana,kanji}] ,atejiname}
names_router.parseAtejiUrl = function (atejiquery){ 
  // atejiArg = _じ-次_えい-英_むず-難 
  // atejiArg = じ-次_えい-英_むず-難 
  // atejiArg = じ-次,えい-英,むず-難 

  var atejis = atejiquery.split("_");// or , |
  var atejis_res = [];
  var ateji_name = "";

  for(var i = 0; i < atejis.length; i++){
    var ateji = atejis[i].split("-");

    console.log(ateji);

    if(ateji.length < 2){
      continue;
    }
    var kana = ateji[0];
    var kanji = ateji[1];


    atejis_res.push({kana: kana, kanji: kanji});
    ateji_name += ateji[1];
  }

  return {chars: atejis_res , ateji_name :ateji_name };
};






names_router.get('/hiragana_str/enum', function(req, res, next) {

});




/* URI *
names_router.get('/:hiragana_str', function(req, res, next) {

  var hiragana_str = req.params.hiragana_str;
  console.log(hiragana_str);

  var ateji_candidates = atejilib.atejiCandidates(hiragana_str);

  res.format({
    'application/json':function(){ res.json({
        hiragana: hiragana_str,
        atejis: ateji_candidates
      });
    },
    'text/html':function(){
      res.render("atejis",{
        hiragana: hiragana_str,
        atejis: ateji_candidates
      });
    }
  });

});
//*/



//atode nandakke
names_router.get('/:hiragana_str/enum', function(req, res, next) {

  var ateji_candidates = atejilib.atejiCandidates(req.params.hiragana_str);

  console.log(ateji_candidates);

  res.json({
    hiragana: req.params.hiragana_str,
    atejis:ateji_candidates
  });

});



names_router.get('/session', function(req, res, next) {
  var sess = req.session;




  res.write('<p>views: ' + sess.views + '</p>');
  if (sess.views) {
    sess.views++;
    if(sess.info && sess.info.sex){
      sess.info.sex.push("sayaka");
    }
    res.write('<p>views: ' + sess.views + '</p>');
    res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
    res.write('<p>sex: ' + sess.sex+'</p>');
    res.write('<p>object: ' + JSON.stringify(sess.info)+'</p>');
    res.end();
  } else {
    sess.views = 1;

    sess.sex = "male";
    sess.info = {
      sorm:"m",
      hentai: true,
      sex: ["hinako", "sayaka", "shiho"]
    };

    res.end('welcome to the session demo. refresh!');
  }

});





