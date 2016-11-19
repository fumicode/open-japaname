
var express = require('express');
var api_router = module.exports = express.Router();

//mongoose
//
var _ = require("underscore");
var co = require("co");
var path = require("path");

var atejilib = require('../core/atejilib.js');


api_router.get("/",(req,res,next)=>{

  var obj = {
    "hoge":"fuga"
  };

  res.render("contents/test", {data:obj});
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



