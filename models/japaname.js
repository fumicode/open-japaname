var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var co = require("co");
var _ = require("underscore");
var autoIncrement = require("mongoose-auto-increment");

var atejilib= require("../core/atejilib.js");

autoIncrement.initialize(mongoose.connection);

var NamePointerSchema = new Schema({
  original:String, //"catherine" など
  ateji: {type:Schema.Types.ObjectId, ref:"Ateji"}, //どちらかが設定される
  kana:  {type:Schema.Types.ObjectId, ref:"Kana"},  //どちらかが設定される 
},{_id:false});

var JapanameSchema = module.exports = new Schema({
  // _id : ObjectId
  names:[NamePointerSchema], //配列であることによって、たとえば自営無頭 グリーン ができる。

  namer: {type:Schema.Types.ObjectId, ref:"User", default:null}   // 
},{
  //オブジェクトやJSONに変換するときに、virtualも変換するように設定
  toObject:{ 
    virtuals:true,
  },
  toJSON:{
    virtuals:true,
  }
});

JapanameSchema.plugin(autoIncrement.plugin,{model:"Japaname"});

JapanameSchema.methods.hasComment = function(){
  //populated ならばだけど。。
  /*
  if(!(this.ateji && this.ateji._id)){
    throw new Error("hasComment cannot be used when ateji is not populated");
  }
  */
  var has = _(this.names).reduce((memo, name)=>{
    return memo || !!name.ateji.hasComment()

  },false );

  console.log("japaname has comment ? " + has);

  return !!has;
};

// 0 => 00-0000-0000
JapanameSchema.virtual("code").get(function(){
  return sta.japanameEncode(this._id);
});

JapanameSchema.virtual("string").get(function(){

  return _(this.names).map(name=>name.ateji.string).join(" ");
});

JapanameSchema.virtual("original").get(function(){
  return _(this.names).map(name=>name.original).join(" ");
});


/////////////////////////////////// STATICS ///////////////////////////////////
var sta  = JapanameSchema.statics;

JapanameSchema.statics.japanameEncode = function (id_num){
  if(!typeof id_num === "number"){
    throw new Error("id_num has to be a number");
  }

  var digit = 6;
  var zeros = repeat("0",digit);
  var zero_num = (zeros + id_num).slice(-digit);
  var code = insertDigitSpliter(zero_num, 4, "-");

  return code;
}



// 0 => 00-0000-0000
JapanameSchema.statics.japanameDecode = function (url_str){
  if(!sta.isJapanameCode(url_str)){
    throw new Error(url_str + " is not a Japaname Code");
  }
  if(typeof url_str !== "string"){
    return url_str;
  }

  var str = url_str.split("-").join("");
  var number = parseInt( str );

  if(!number){
    throw new Error(url_str + " is not a Japaname Code");
  }

  return number;
}

JapanameSchema.statics.isJapanameCode = function (url_str){
  if(!typeof url_str === "string"){
    throw new Error("url_str has to be a string");
  }

  return /[0-9\-]+/.test(url_str); 
}

JapanameSchema.statics.findByCode = function(japaname_code){
  var japaname_id = sta.japanameDecode(japaname_code);

  return this.findById(japaname_id)
    .populate("names.ateji")
    .populate("names.kana");
}


/*
JapanameSchema.pre("save", function(next){
  next();
});
*/

//なかなかふくざつだなあ。
//とりあえず、名字か名前ひとつだけで、Atejiのつもりで。

JapanameSchema.statics.createNew = function(names, namer_id){
  var Japaname = this;
  return co(function*(){

    var Ateji = mongoose.model("Ateji");

    // yield [promise]  == [ateji]
    var atejis = yield _(names).map((name)=>Ateji.createNew(name.atejis));

    var japaname_params = _(atejis).map((ateji, index)=>{
      var name = names[index]
      return {
        original:name.original,
        ateji:ateji._id,
        kana:null
      }
    });

    var newJapaname = new Japaname({
      //_id:auto increment
      names:japaname_params,
      namer:namer_id || null
    });

    return newJapaname.save();

  });
}


JapanameSchema.statics.getLatestNames = function (num){
  var Japaname = this;
  
  return Japaname.find()
        .sort({"_id":-1})
        .limit(num || 5)
        .populate("names.kana")
        .populate("names.ateji");
};

JapanameSchema.statics.findLatestNames = JapanameSchema.statics.getLatestNames;

JapanameSchema.statics.findLatestNamesOfNamer= function (num, user_id){
  var Japaname = this;
  
  return Japaname.find({namer:user_id})
        .sort({"_id":-1})
        .limit(num || 5)
        .populate("names.kana")
        .populate("names.ateji");
};




function insertDigitSpliter(str, split_digit, spliter){

  var split_point = str.length;

  while(split_point > 0){
    split_point -= split_digit;

    if(!(split_point > 0)){
      break;
    }

    str = insertStr(str,split_point, spliter);
  }

  return str;
}


function repeat(str, num){
  var repeated= "";

  for(var i = 0; i < num ; i++){
    repeated += str;
  }

  return repeated;
}

function insertStr(str, index, insert) {
  return str.slice(0, index) + insert + str.slice(index, str.length);
}
