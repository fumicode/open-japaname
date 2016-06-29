var mongoose = require('mongoose');
var _ = require("underscore");

var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = module.exports = new mongoose.Schema({
  //username :String, //set up by passportLocalMongoose
  //password :String  //set up by passportLocalMongoose
  
  oauth_info:{

  },

  my_japaname:{ type:Number, ref:"" },

  //authorities:[String], //admin,kanji-edit,content-edit,

});


UserSchema.plugin(passportLocalMongoose,{missingPasswordError: "Foutief password"});


/*
UserSchema.virtual('userinfo.email').get(function () {
  var this_user = this;
  var method = this_user.userinfo.method;
  return this_user.userinfo[method].email;
}).set(function (email) {
  var this_user = this;

  this_user.userinfo.local =  this_user.userinfo.local || {};

  this_user.userinfo.local.email = email;

});
*/

UserSchema.methods.haveRight = function(right){
  return _(this.authorities).contains(right);
};

