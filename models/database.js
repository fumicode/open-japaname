var mongoose = require('mongoose');
var _us = require('underscore');
var url = 'mongodb://localhost/ateji';

var db_obj = module.exports = {};

mongoose.Promise = global.Promise;
  
mongoose.connect(url);

// 接続イベントを利用してログ出力
mongoose.connection.on('connected', function () {
  console.log('mongoose URI locates ' + url);
});


var UserSchema  = require("./user.js");
var AtejiSchema = require("./ateji.js");
var KanjiSchema = require("./kanji.js");
var WordSchema  = require("./word.js");

mongoose.model("User",UserSchema);
mongoose.model("Ateji",AtejiSchema);
mongoose.model("Kanji",KanjiSchema);
mongoose.model("Word",WordSchema);

db_obj.db_loaded_promise = Promise.resolve("loaded DB");

