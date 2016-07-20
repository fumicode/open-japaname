var mongoose = require('mongoose');
var _ = require("underscore");

var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = module.exports = new mongoose.Schema({
  username :String, //set up by passportLocalMongoose
  password :String, //set up by passportLocalMongoose

  oauth_info:{ },

  my_japaname:{ type:Number, ref:"Japaname" },
  authorities:[String], //admin,kanji-edit,content-edit,
});


UserSchema.plugin(passportLocalMongoose,{
  missingPasswordError: "Foutief password",

});

UserSchema.statics.doesExist = function(username){
  var User = this;
  return User.findOne({username}).exec();
}


UserSchema.methods.haveRight = function(right){
  return _(this.authorities).contains(right);
};

