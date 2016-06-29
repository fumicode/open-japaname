var router_helper = module.exports = {};

var _ = require("underscore");



//複数行のテキストを、空行を無視して行ごとの配列に変換する。
router_helper.stringToArray= function (text, splitee){
  var splited = text.split(splitee);
  var array =  _.reduce(splited, function(memo,line){
    if(line !== ""){
      memo.push(line.replace(/^\s+|\s+$/g,''));
    }
    else{ //改行を無視する
      //do nothing
    }
    return memo;
  },[]);

  return array;
};

router_helper.convertLinesToArray = function (text){
  return router_helper.stringToArray(text,/\r?\n/);
};

