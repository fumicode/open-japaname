var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require("underscore");


var SomeSchema = module.exports = new Schema({
  prop: String,
  prop2: String
},{
  //some optsions
});



SomeSchema.virtual('some_virtual_prop').get(function () {

});



SomeSchema.methods.someMethod = function(){
}

SomeSchema.statics.someStaticMethod= function (){

};

