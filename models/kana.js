var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require("underscore");


var KanaSchema = module.exports = new Schema({
  // _id : ObjectID ... refered by Japaname
  type:String, //"hira" or "kata"
  text:String  //ひらがな or かたかな
});
