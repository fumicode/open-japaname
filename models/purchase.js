var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require("underscore");
var co = require("co");

var artworks = require("../models/artworks.js");

var PurchaseSchema = module.exports = new Schema({
  //_id :ObjectId
  buyer:        {type:Schema.Types.ObjectId, ref:"User", required:true },
  closed :      {type:Boolean, required:true},
  price :       {type:Number,  required:true},

  artwork_name: {type:String,  required:true},
  japaname:     {type:Number, ref:"Japaname", required:true}
});


PurchaseSchema.statics.createNew = function(params){
  console.log("create new purchase start");
  var Purchase = this;
  return co(function*(){
    //params
    var buyer_id = params.buyer_id;
    var price    = params.price; 
    var artwork_name  = params.artwork_name; 
    var japaname_code = params.japaname_code;

    //models
    var User = mongoose.model("User");
    var Japaname = mongoose.model("Japaname");

    if(!(buyer_id && price && artwork_name && japaname_code)){
      throw new Error("missing parameter");
    }


    var buyer = yield User.findById(buyer_id).exec();
    if(!buyer){
      throw new Error("buyer " +buywer_id+ " not found");
    }


    //数字であることは仮定
    if(price < 0){
      throw new Error("price is invalid");
    }



    if(!artworks.doesExist(artwork_name)){

      throw new Error("item "+artwork_name+" not found.");
    }

    var japaname = yield Japaname.findByCode(japaname_code).exec();

    if(!japaname){
      throw new Error("japaname "+japaname_code+" not found.");
    }

    var pur = new Purchase({
      buyer:buyer._id,
      price,
      artwork_name,
      japaname:japaname._id,
      closed:false
    });

    var result = yield pur.save();
    console.log("purchase completed" + result);
    return result;
  });
}

PurchaseSchema.statics.doesExist = function(params){
  Purchase = this;
  return co(function*(){
    var user_id     = params.user_id;
    var artwork_name= params.artwork_name;
    var japaname_id = params.japaname_id;

    var purchase = yield Purchase
      .findOne({ buyer:user_id, artwork_name, japaname:japaname_id})
      .exec();

    console.log("purchase ?");
    console.log(purchase);

    return purchase;
  });
}

//need save!!
PurchaseSchema.methods.close = function(closer_obj){
  if(closer_obj.haveRight("closing")){
    this.closed = true;
  }
  else{
    throw new Error("closer "+closer_obj._id+" have no right to close");
  }
}





