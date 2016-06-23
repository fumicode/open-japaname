var atejilib = require('../core/atejilib.js');
var history = require('../util/history');

var pushHistory = history.pushHistory;
var showHistory    = history.showHistory;

var express = require('express');
var _us = require('underscore');
var router = express.Router();

var cookie   = require('cookie');

var mongoose = require("mongoose");

var User = mongoose.model("User");
var Ateji= mongoose.model("Ateji");

var co = require("co");


var authModule = require("../authentication/authModule.js");
var loginCheck = authModule.loginCheck;


/*
router.get('/', function(req, res, next) {
  var hiragana_str = req.query.hiragana_str;
  console.log(hiragana_str);

  var ateji_candidates = atejilib.atejiCandidates(hiragana_str);

  res.render("atejis",{
    hiragana: hiragana_str,
    atejis:ateji_candidates
  });

});
*/

/*
router.get("/make-icon", function(req, res, next){
  var param_id = req.query.ateji_id;
  console.log("saved/ddd");
  var ateji_id = param_id.split("-").join("");

  Ateji.findAtejiById(ateji_id,function(ateji){

    res.render("atejis/make-icon", {ateji:ateji});
  },function(error){
    next(error);
  });

});
*/

router.get("/saved/:ateji_id([0-9]+)", function(req, res, next){
  var param_id = req.params.ateji_id;
  console.log("saved/ddd");

  var ateji_id = param_id.split("-").join("");

  console.log("trying to find ateji "+ ateji_id);

  (function(next){
    Ateji.findAtejiById(ateji_id,function(ateji){

      console.log("-----ateji found-----");
      console.log(ateji);

      next(ateji);
    },
    function(err){
      res.respond404("couldn't find Ateji" + ateji_id);
    });

  }(function(ateji){

    ///////////////history///////////////
    var ateji_history_id = pushHistory(req.session, ateji._id);
    Ateji.findAtejisByIds(ateji_history_id,function(ateji_history){
      res.cookie("ateji_id", ateji_id ); 

      console.log(JSON.stringify(ateji.atejis_populated));
      
      res.render("atejis/selected", {
          original_name: ateji.original_name, 
          ateji:ateji,
          ateji_name: ateji.ateji_name, 
          atejis: ateji.atejis_populated,
          ateji_id: ateji_id,
          ateji_history: ateji_history,
          share_url: "http://ateji.jp/" + ateji_id, 
      });
    },function(err){


      res.render("atejis/selected", {
          original_name: ateji.original_name, 
          ateji_name: ateji.ateji_name, 
          atejis: ateji.atejis_populated,
      });
      
    });

  }));
});


router.get("/saved/:ateji_id([0-9]+)/risumaru", authModule.authorize("kanji-edit"), function(req, res, next){

  co(function*(){

    var param_id = req.params.ateji_id;
    console.log("saved/ddd");

    var ateji_id = param_id.split("-").join("");

    console.log("trying to find ateji "+ ateji_id);

    var ateji = yield Ateji.findById(ateji_id).exec();

    res.render("atejis/risumaru" , {ateji});


  }).catch((err)=>{
    next(err);


  });

});

router.get('/candidates/', function(req, res, next){//?original_name=james を想定
  var original_name = req.query.original_name;
  //名前が空だったらtopにリダイレクト
  if(!original_name){
    res.redirect("/");
  }

  res.redirect("/atejis/candidates/" + encodeURIComponent(original_name));
});

function isNumber(num_str){
  return !! num_str.match(/^\d+$/);
}

router.get('/candidates/:original_name', function(req, res, next) {

  var original_name = req.params.original_name;
  //名前が空だったらtopにリダイレクト
  if(!original_name){
    res.redirect("/");
    return;
  }

  //数字が入力されたらidだと思って結果ページにそのままいく
  if(isNumber(original_name)){

    var ateji_id = original_name;
    res.redirect("/" + ateji_id);
    return;
  }
  var original_names = original_name.split(/[ ,　,\,,\|,\\,\/]+/);

  var nullify = function(err){ return Promise.resolve(null); };

  var promise_array = _us.map (original_names, function(original_name){
    return atejilib.translateAteji(original_name).catch(nullify);
  });

  console.log(promise_array);

  Promise.all(promise_array).then( function(translated_names){

    console.log(translated_names);



    var name_list = [];
    var name_obj = {};

    name_obj.hiragana= "";

    _us(translated_names).each(function(name,index){
      console.log("name : " + name + " ["+index+"]");
      if(!name){
        return ;
      }

      name_obj.hiragana += name.hiragana;
      name_list .push(name);

    });


    console.log( "original name:" + name_obj.original_name + " lang:"+ name_obj.detected_langs);
    console.log( "translated HIRAGANA" + name_obj.hiragana);

    name_obj.hiragana_nosmall = atejilib.hiraganaToNosmall(name_obj.hiragana.split(''));
    //ダブってるがまあいいか

    //ローマ字
    name_obj.romajis = _us.map(name_obj.hiragana_nosmall,
      function(el_hiragana){
        return atejilib.hiraganaToRomaji(el_hiragana);
      }
    );

    var obj = atejilib.atejiSyllables(name_obj.hiragana);
    var syllables = obj.syllables;

    atejilib.addMeaningToSyllables(syllables);

    //テーブルをつくる
    name_obj.syllables_table = atejilib.arrangeSyllablesTable(syllables, obj.length);




    res.render("atejis/candidates",{
      original_name: original_name, 
      name_list:name_list,
      name_obj:name_obj
    });

  })
  .catch(function(err){

      var error_message = " We are sorry, "+ original_name +". <br> "+
      "Your name couldn't be translated to Japanese sound by Google translation API.<br> "+
      "We are planning to introduce more general name translater.  <br>"+
      "Enter another name (like family name) or <a href='https://twitter.com/ateji_jp'>send request on twitter</a>. <br>"+
      "<a href='/'>Go to top page.</a>. "; 
    res.respondError(error_message, err);
  });

});

//returns {chars: [{kana,kanji}] ,atejiname}
router.parseAtejiUrl = function (atejiquery){ 
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


router.post('/selected', function(req, res, next) {
  var original_name = req.body.original_name;
  var atejiquery = req.body.ateji;

  //returns object  {chars:[{kanji,kana}], ateji_name:String}
  var atejis_res = router.parseAtejiUrl(atejiquery);

  Ateji.saveNewAteji(original_name,atejis_res.chars,function(ateji){

    pushHistory(req.session, ateji._id);

    req.session.save(function(err){
      if(err){
        res.end("err" + err);
      }
      res.redirect("/"+ ateji._id);
    });

  },function(err){
    res.respondError("Unable to save ateji", err);
    return ;
  });

});




router.get('/hiragana_str/enum', function(req, res, next) {

});




/* URI *
router.get('/:hiragana_str', function(req, res, next) {

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
router.get('/:hiragana_str/enum', function(req, res, next) {

  var ateji_candidates = atejilib.atejiCandidates(req.params.hiragana_str);

  console.log(ateji_candidates);

  res.json({
    hiragana: req.params.hiragana_str,
    atejis:ateji_candidates
  });

});



router.get('/session', function(req, res, next) {
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
router.get('/history', function(req, res, next) {

  ///////////////history///////////////
  var ateji_history_id = req.session.history;

  Ateji.findAtejisByIds(ateji_history_id,function(ateji_history){

    res.render("atejis/history", {
      ateji_history: ateji_history,
    });

  },function(err){
    res.render("atejis/history", { }); 
  });


});



module.exports = router;

