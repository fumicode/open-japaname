
var express = require('express');
var api_router = module.exports = express.Router();

//mongoose
//
var _ = require("underscore");
var co = require("co");
var path = require("path");

var atejilib = require('../core/atejilib.js');

var mongoose = require("mongoose");
var Kanji = mongoose.model("Kanji");
var Japaname = mongoose.model("Japaname");


api_router.get("/",(req,res,next)=>{

  var obj = {
    "hoge":"fuga"
  };

  res.render("contents/test", {data:obj});
});

api_router.get("/core",(req,res,next)=>{
  var obj = {
    "hoge":"fuga"
  };
  res.render("contents/test", {data:obj});
});


api_router.get("/core/names/:japaname_id([0-9\-]+)", function(req, res, next){
  co(function*(){
    console.log("kitemasu");
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

    res.header("Access-Control-Allow-Origin","*");

    /*
    var japaname_json = {
      japaname_id:japaname._id,
      names:[{
        original:japaname.names[0].original,
        ateji:{
          string:japaname.names[0].ateji.string,
          atemojis:
          

        }
      }];
    };
    _(japaname).map((prop)=>{
      
    });
    */
    res.json(japaname.toObject());

  }).catch((err)=>{
    res.status(500);
    res.json({error:err.message});
  });
});


var accessControl = "*";
api_router.post('/core/names', function(req, res, next) {
  co(function*(){
    //美しくないなあ。それだったらbodyそのものをjsonにすればいいじゃん
    //何か理由があったんだっけ？クライアントサイドがつくりにくいとか
    //かえたい。 20161212
    //依存してるのは、names/candidatesと
    //crafti/japaname_frame.あとでかえる。
    //atejiってのも、atemojisが正確な表現

    var original_name = req.body.original_name;
    var ateji         = JSON.parse(req.body.ateji);

    console.log(ateji); //JSON [{kana,kanji,sylindex}]
    var newJapaname = yield Japaname.createNew([{original:original_name, ateji}]);
    var url_id = Japaname.japanameEncode(newJapaname._id);

    //超危険！ どこからでもアクセスを許しちゃう。
    res.set("Access-Control-Allow-Origin",accessControl );

    res.json({
      japaname_id:url_id,
    });

  }) .catch((err)=>{
    res.set("Access-Control-Allow-Origin",accessControl );
    res.status(500);
    res.json({"error":err.message});
  });
});



api_router.get("/crafti/japaname_frame.js", function(req, res, next) {
  return res.sendFile(path.join(__dirname, "../public/crafti/", "japaname_frame.js"));
});

api_router.get("/crafti/japaname_frame.css", function(req, res, next) {
  return res.sendFile(path.join(__dirname, "../public/crafti/", "japaname_frame.css"));
});


api_router.get("/crafti/names/",(req,res,next)=>{
  var original_name = req.query.original_name;
  
  if(!original_name){
    return res.render("api/crafti_not_found",{
      original_name
    });
  }

  //リダイレクト
  res.redirect(req.baseUrl + "/api/" + encodeURIComponent(original_name));
});

api_router.get("/crafti/names/:original_name", function(req, res, next) {
  co(function*(){
    var original_name = req.params.original_name;
    //名前が空だったらtopにリダイレクト
    if(!original_name){
      return res.render("api/crafti_not_found",{
        original_name
      });
    }

    var original_names = original_name.split(/[ ,　,\,,\|,\\,\/]+/);
    var nullify = err => Promise.resolve(null); 
    var translated_names = yield _(original_names).map(function(original_name){
      return atejilib.toJapaneseSound(original_name).catch(nullify);
    });

    var succeeded_names = _(translated_names).filter(a=>a); //falseになるもの(null)は排除される


    if(succeeded_names.length < 1){
      return res.render("api/crafti_not_found",{
        original_name
      });
    }

    console.log(succeeded_names);

    var name_objs = _(succeeded_names).map(function(name_obj,index){
      name_obj.hiragana_nosmall = atejilib.hiraganaToNosmall(name_obj.hiragana);

      //ローマ字
      name_obj.romajis_array = _(name_obj.hiragana_nosmall).map(atejilib.hiraganasToRomajis);
      
      var obj = atejilib.atejiSyllables(name_obj.hiragana);
      // obj =   length syllables hiragana_str_nosmall
    
      var syllables = name_obj.syllables = obj.syllables;

      //美しくないな
      atejilib.addMeaningToSyllables(syllables);

      //テーブルをつくる
      name_obj.syllables_table = atejilib.arrangeSyllablesTable(syllables, obj.length);

      return name_obj;
    });

    res.render("api/crafti",{
      original_name,
      name_objs
    });
  })
  .catch(function(err){
    next(err);
  });
});

api_router.get("/crafti/kanjis",(req,res,next)=>{
  var kanjis = atejilib.getKanjis();

  res.header("Access-Control-Allow-Origin","*");

  return res.jsonp(kanjis);
});

api_router.get("/crafti/kanjis/random",(req,res,next)=>{
  var kanjis = atejilib.getKanjis();
  //オブジェクトの中身まではいじっちゃだめだよ！キャッシュを傷つけちゃう。
  //まだディープコピーしてないから。

  var N = (1 * req.query.n) || 50;

  if(N > kanjis.length){
    return res.jsonp(kanjis);
  }
  
  var indexes = getRandomIndexes(kanjis.length, N);
  console.log(indexes);

  var selected_kanjis = _(indexes).reduce((memo, index)=>{
    memo.push(kanjis[index])
    
    return memo;
  },[]);


  return res.jsonp(selected_kanjis);
});


api_router.get("/crafti/kanjis/select",(req,res,next)=>{
  co(function*(){
    var kanjis_str = req.query.kanjis;
    var kanjis_array = kanjis_str.split("");

    var kanjis = atejilib.kanjiDocsToArray(yield Kanji.find({_id:{$in:kanjis_array}}).exec());

    return res.jsonp(kanjis);
  }).catch(err=>next(err));
});


//return [Number]
function getRandomIndexes(n,m){
  if(!(n >= m)){
    throw new Error("n should be bigger than m");
  }
  var numbers = []; 

  for(var i = 0; i < n; i++)
  {
    numbers[i] = i;
  }

  //i : 選んだ数
  for(var i = 0; i < m; i++){
    var length = n - i;
    var index = Math.floor(Math.random() * length + i);

    switchInArray(numbers, index, i);

  }

  //numbersの前半m個
  return numbers.slice(0,m);
}


function switchInArray(array, i, j){
  var tmp = array[i];
  array[i] = array[j];
  array[j] = tmp;
}







