var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var co = require("co");
var _ = require("underscore");
var autoIncrement = require("mongoose-auto-increment");


autoIncrement.initialize(mongoose.connection);

var NamePointerSchema = new Schema({
  original:String, //"catherine" など
  ateji: {type:Schema.Types.ObjectId, ref:"Ateji"}, //どちらかが設定される
  kana:  {type:Schema.Types.ObjectId, ref:"Kana"},  //どちらかが設定される
},{_id:false});

var JapanameSchema = module.exports = new Schema({
  // _id : ObjectId
  names:[NamePointerSchema] //配列であることによって、たとえば自営無頭 グリーン ができる。
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

  return this.findById(japaname_id);
}


/*
JapanameSchema.pre("save", function(next){
  next();
});
*/

//なかなかふくざつだなあ。
//とりあえず、名字か名前ひとつだけで、Atejiのつもりで。

JapanameSchema.statics.createNew = function(names){
  var Japaname = this;
  return co(function*(){

    // yield [promise]  == [ateji]
    var atejis = yield _(names).map((name)=>{
        var atemojis = name.atejis;

        var Ateji = mongoose.model("Ateji");

        //!!!! atemojis のバリデーション
        var newAteji = new Ateji({atemojis});

        return newAteji.save();//returns promise
    });




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
      names:japaname_params
    });

    return newJapaname.save();

    /*
      else if(first_name.kana){
        var text = atemojis_or_text;
        var Kana = mongoose.model("Kana");

        var newKana = new Kana({type:"hira",text:text});

        try{
          var savedKana = yield newKana.save();
        }
        catch(err){
          console.error("couldn't save kana. ");
          throw err;
        }

        var kana_id = savedKana._id;
        var newJapaname = new Japaname({
          //_id:auto increment
          original_names,
          names:[{
            original:first_name.original,
            ateji:null,
            kana:kana_id
          }]
        });

        var savedJapaname = yield newJapaname.save();
        return savedJapaname;
      }
      else {
        throw new Error("japaname data incorrect");
      }
    */
  });
}


JapanameSchema.statics.getLatestNames = function (num){
  var Japaname = this;
  
  return Japaname.find()
        .sort({"_id":-1})
        .limit(num || 5)
        .populate("names.ateji")
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
