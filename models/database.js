var mongoose = require('mongoose');
var _us = require('underscore');

var db_obj = module.exports = {};

//こいつをprocessに依存させるのはあんまりよくない。。
if(process.env.DB == "local"){
  var url = db_obj.db_url = "mongodb://localhost/ateji";
}
else{
  var url = db_obj.db_url = 'mongodb://japaname:japaname13579@db.japaname.jp/ateji';
}


mongoose.Promise = global.Promise;
  
mongoose.connect(url);

// 接続イベントを利用してログ出力
mongoose.connection.on('connected', function () {
  console.log('mongoose URI locates ' + url);
});


var UserSchema = require("./user.js");
var JapanameSchema = require("./japaname.js");
var AtejiSchema = require("./ateji.js");
var KanaSchema = require("./kana.js");
var KanjiSchema = require("./kanji.js");
var WordSchema  = require("./word.js");
var PurchaseSchema  = require("./purchase.js");
var KanjihouseMailSchema  = require("./kanjihouse_mail.js");

mongoose.model("User",UserSchema);
mongoose.model("Japaname",JapanameSchema);
mongoose.model("Ateji",AtejiSchema);
mongoose.model("Kana",KanaSchema);
mongoose.model("Kanji",KanjiSchema);
mongoose.model("Word",WordSchema);
mongoose.model("Purchase",PurchaseSchema);
mongoose.model("KanjihouseMail",KanjihouseMailSchema);

db_obj.db_loaded_promise = Promise.resolve("loaded DB");

