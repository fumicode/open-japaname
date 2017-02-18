var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require("underscore");


var KanjihouseMailSchema = module.exports = new Schema({
  name: {type:String, default:""}, //staff memo用
  title: {type:String, default:""},
  tos: {type:[String], default:[]},
  japanames:{type:[{type:Number, ref:"Japaname"}], default:[]},
  content: {type:String, default:""},
  photos:{type:[String], default:[]},
  sent: {type:Boolean, default:false}
});



KanjihouseMailSchema.virtual('some_virtual_prop').get(function () {
  

});

KanjihouseMailSchema.methods.someMethod = function(){

}

KanjihouseMailSchema.statics.someStaticMethod= function (){

};



