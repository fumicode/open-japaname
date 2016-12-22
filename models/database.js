var mongoose = require('mongoose');
var _us = require('underscore');

var db_obj = module.exports = {};

var url = db_obj.db_url = 'mongodb://japaname:japaname13579@db.japaname.jp/ateji';

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

mongoose.model("User",UserSchema);
mongoose.model("Japaname",JapanameSchema);
mongoose.model("Ateji",AtejiSchema);
mongoose.model("Kana",KanaSchema);
mongoose.model("Kanji",KanjiSchema);
mongoose.model("Word",WordSchema);
mongoose.model("Purchase",PurchaseSchema);

db_obj.db_loaded_promise = Promise.resolve("loaded DB");

