var hiraganas         = require("./tables/hiraganas_table.json");
var katakanas         = require("./tables/katakanas_table.json");
var katakana2hiragana = require("./tables/katakana_to_hiragana.json");
var hiragana2katakana = require("./tables/hiragana_to_katakana.json");

var hiragana_to_nosmall = require("./tables/hiragana_to_nosmall.json");
var katakana_to_nosmall = require("./tables/katakana_to_nosmall.json");

var hiragana_to_romaji = require("./tables/hiragana_to_romaji.json");

var name_db           = require("./tables/name_db.json");

var _ = require('underscore');
var co = require('co');


var romajisToHiraganas = require("./romajisToHiraganas");


var atejimap = {};
var kanjis_meanings = {};


//ateji lib 
var atejilib = module.exports = {};


//returns array of hiragana
atejilib.translateAsRomaji = romajisToHiraganas;

//Kanji
//Hiragana
//Hiragana_nosmall

//Kdatakana
//Katakana_nosmall




// 漢字を変更したらこれを読まなきゃいけない という規約
atejilib.loadKanjiDB = function(){
  return co(function*(){
    console.log("db");
    var mongoose = require("mongoose");
    var db = require('../models/database.js');
    var Kanji = mongoose.model("Kanji");

    var kanjis = yield  Kanji.find().exec();

    var atejimap_ = {};
    var kanjis_meanings_ = {};

    _(kanjis).each((kanji)=>{
      _(kanji.sounds).each((sound)=>{

        //DBではsmall形式で保存してあるのだが、ここでNOSMALLになおす。
        //若干ややこしいが、健全か。
        sound  = atejilib.hiraganaToNosmall(sound);
        atejimap_[sound] = atejimap_[sound] || [];
        atejimap_[sound].push(kanji._id);
      });

      kanjis_meanings_[kanji._id] = kanji.meanings;
    });

    console.log("atejimap switched!");

    atejimap = atejimap_; //atejilib内グローバルに代入
    kanjis_meanings = kanjis_meanings_; //atejilib内グローバルに代入

    return {
      atejimap,
      kanjis_meanings
    }
  });
};



/////////////////////// character checker ////////////////////////////
atejilib.isASCII= function (str) {
  return /^[\x00-\x7F]*$/.test(str);
};

//@return bool
atejilib.isAlphabet = function (character) { //character: char
  return "abcdefghijklmnopqrstuvwxyz".indexOf(character) != -1;
};

//@return bool
atejilib.isAlphabets = function (array_of_char) { //str any string

  if(array_of_char.length === 0){
    return false;
  }

  for(var i = 0; i < array_of_char.length; i++){
    if(!atejilib.isAlphabet(array_of_char[i])){
      return false;
    }
  }

  return true;
};

atejilib.isHiragana = function (character) { //str any string
  return hiraganas.indexOf(character) !== -1;
};


atejilib.isKatakana = function (character) { //str any string
  return katakanas.indexOf(character) !== -1;
};


atejilib.isHiraganas = function (array_of_char) { //str any string
  if(array_of_char.length === 0){
    return false;
  }
  for(var i = 0; i < array_of_char.length; i++){
    if(!atejilib.isHiragana(array_of_char[i])){
      return false;
    }
  }

  return true;
};


atejilib.isKatakanas = function (array_of_char) { //str any string
  if(array_of_char.length === 0){
    return false;
  }


  for(var i = 0; i < array_of_char.length; i++){
    if(!atejilib.isKatakana(array_of_char[i])){
      return false;
    }
  }
  
  return true;
};


/////////////////////// translater ////////////////////////////
atejilib.syllableToKanjis = function(syllable_in_hiraganas){
  return atejimap[syllable_in_hiraganas];
};

//alphabet_str -> katakana_str
atejilib.translateByDict = function(alphabet_str){ //str any string
  return co(function*(){
    console.log("alphabets to katakanas");
    console.log(alphabet_str);
    console.log(alphabet_str[0].toUpperCase());

    var alphabet_group = name_db[alphabet_str[0].toUpperCase()];
    var katakana_set = alphabet_group && alphabet_group[alphabet_str];
    var katakana_name = katakana_set && katakana_set[0];

    if(katakana_name){
      console.log("found " + katakana_name); 
      var hiragana = atejilib.katakanasToHiraganas(katakana_name);

      console.log(alphabet_str);
      return new JapaneseSound({
        hiragana,
        katakana:katakana_name,
        original_name:alphabet_str,
        detected_lang:"en"
      });

    }
    else{
      console.log("not found " + alphabet_str); 
      throw new Error("not found "+ alphabet_str);
    }

  });

};


atejilib.hiraganasToKatakanas = function (hiraganas){ //hiraganas: expected to be hiraganas
  var katakanas = "";

  
  for(var i = 0; i <hiraganas.length; i++){
    var hiragana = hiraganas[i];

    //va vu vo!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    katakanas += hiragana2katakana[hiragana];
  }

  return katakanas;
};


//returns array_of hiraganas_
atejilib.katakanasToHiraganas = function (katakanas){ //hiraganas: expected to be hiraganas
  var hiraganas = "";
  
  for(var i = 0; i < katakanas.length; i++){
    var katakana = katakanas[i];

    //va vu vo!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    hiraganas += katakana2hiragana[katakana];
  }

  return hiraganas;
};

atejilib.hiraganasToRomajis = atejilib.hiraganaToRomaji = function (hiragana_str){ //hiraganas: expected to be hiraganas
  //単純過ぎる！！


  var romaji_str ="";

  for(var i = 0; i < hiragana_str.length; i++){
    var hiragana = hiragana_str[i];

    romaji_str += hiragana_to_romaji[hiragana] + " ";
  }

  return romaji_str;
};

atejilib.getAtejimap = function(){
  return clone(atejimap); 
};





//@return array of hiragana nosmall
atejilib.hiraganaToNosmall = function(hiraganas){ //hiraganas: expected to be hiraganas
  var hiraganas_nosmall ="";

  //console.log(hiraganas);
  
  for(var i = 0; i < hiraganas.length; i++){
    var newchar = ""; //new char to substitute

    if(hiraganas[i]==="っ") // continue ltu
      continue;

    if(hiraganas[i]==="ー"){
      if(i === 0){ //skip first -
        continue;
      }

      var prevHiragana = getBoin(hiraganas[i-1]);


      switch(prevHiragana){
        case "あ":
          continue;

        case "い":
          newchar = "い";
          break;
        case "う":
          newchar = "う";
          break;
        case "え":
          newchar = "い";
          break;
        case "お":
          newchar = "う";
          break;
        default:
          continue;
      }
    }

    hiraganas_nosmall += 
      (newchar || hiragana_to_nosmall[hiraganas[i]] || hiraganas[i]);
  }

  return hiraganas_nosmall;

};



function getBoin(hiragana) { //str any string
  if(["あ","ぁ","か","が","さ","ざ","た","だ","な","は","ぱ","ば","ま","や","ゃ","ら","わ"]
      .indexOf(hiragana) != -1){
        return "あ";
  }
  else if(["い","ぃ","き","ぎ","し","じ","ち","ぢ","に","ひ","ぴ","び","み","り"]
      .indexOf(hiragana) != -1){
        return "い";
  }
  else if(["う","ぅ","く","ぐ","す","ず","つ","づ","ぬ","ふ","ぷ","ぶ","む","ゆ","ゅ","る"]
      .indexOf(hiragana) != -1){
        return "う";
  }
  else if(["え","ぇ","け","げ","せ","ぜ","て","で","ね","へ","ぺ","べ","め","れ"]
      .indexOf(hiragana) != -1){
        return "え";
  }
  else if(["お","ぉ","こ","ご","そ","ぞ","と","ど","の","ほ","ぽ","ぼ","も","よ","ょ","ろ","を"]
      .indexOf(hiragana) != -1){
        return "お";
  }
  else if(["っ","ん","ー"]
      .indexOf(hiragana) != -1){
        return "";
  }

}


//@return array of array of Kanji String
function allAteji(array_of_hiraganas_nosmall){ //hiragana_str: String in hiragana
  /*var kanji_array = [];

  for(var i = 0; i < array.length; i++){
    kanji_array.push(atejimap[array[i]][0]);

  }
  */

  var array = array_of_hiraganas_nosmall.slice();


  return do_ateji([],array);
}


function do_ateji(kanji_array,left_hiraganas){
  if(left_hiraganas.length === 0){

    return [kanji_array];
  }

  var cand_kanji = atejimap[left_hiraganas[0]] ;// ["kanji1", "kanji2"]

  var cand_str;
  var cand; 
  // if corresponding kanji does not exit, ignore this hiragana.
  if(!cand_kanji || cand_kanji.length === 0){ 
    cand_str = kanji_array.slice(); //copy array
    cand = do_ateji(cand_str,left_hiraganas.slice(1));//slice left hiragana
    return cand;
  }

  //
  var ret = [];
  for(var i = 0; i < cand_kanji.length; i ++){
    cand_str = kanji_array.concat(cand_kanji[i]);


    cand = do_ateji(cand_str,left_hiraganas.slice(1));
    ret = ret.concat(cand);
  }
  
  return ret;
}

function clone(obj) {
  if (null === obj || "object" !== typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) if (obj.hasOwnProperty(attr)){
    copy[attr] = obj[attr];
  }
  return copy;
}

//@return candidate object
atejilib.atejiCandidates = function (hiraganas_str){ //hiraganas: array of hiraganas , progress: array of object
  if(!atejilib.isHiraganas(hiraganas_str)){
    throw new Error("enter HIRAGANAS");
  }


  hiraganas = hiraganas_str;

  var hiraganas_nosmall = atejilib.hiraganaToNosmall(hiraganas);

  return do_atejiCandidates(hiraganas_nosmall);
};

function do_atejiCandidates(hiraganas, progress){ //hiraganas: array of hiraganas , progress: array of object
  if(!progress){
    progress = [];
  }

  if(hiraganas.length === 0){
    return [progress];
  }


  var ret = [];

  for(var i = 3; i > 0; i --) // loop HIRAGANA LENGTH
  {
    var key = "";

    if(hiraganas.length < i){
      continue;
    }
    
    for(var j = 0; j < i; j ++) //generate key HIRAGANAS
    {
      key += hiraganas[j];
    }
    //slice -> join is easier

    if(atejimap[key]){
      var progress_copy = progress.slice();
      progress_copy.push({kana:key ,ateji: atejimap[key]});
      ret = ret.concat(do_atejiCandidates(hiraganas.slice(i), progress_copy));
    }

  }

  return ret;
}


//return object of length & syllables candidates
atejilib.atejiSyllables = function (hiraganas_str){


  if(!atejilib.isHiraganas(hiraganas_str)){
    throw new Error("enter HIRAGANAS not " + array_of_string);
  }

  var hiraganas_nosmall = atejilib.hiraganaToNosmall(hiraganas_str);

  return {
    length: hiraganas_nosmall.length, 
    syllables:do_atejiSyllables(hiraganas_nosmall),
    hiragana_str_nosmall:hiraganas_nosmall
  };
};


//return syllables candidates
function do_atejiSyllables(hiraganas_nosmall){

  var hiraganas = hiraganas_nosmall.split(''); // [じ,え,い,む,ず] 


  var array_of_syllables = [];

  for(var j = 0; j < hiraganas.length; j ++){//roop for hiraganas

    for(var slice_length = 3; slice_length >= 1; slice_length --) 
    if(j + slice_length <= hiraganas.length){
      var key = hiraganas.slice(j,slice_length+j).join('');

      var atejis = atejimap[key];
      if(atejis){

        array_of_syllables.push({
          index:j,
          next_index: j + slice_length, //if it comes length, finish
          kana:key,
          romaji:atejilib.hiraganaToRomaji(key),
          atejis:atejis
        });
      }
    } 
  }

  return array_of_syllables;
}


atejilib.arrangeSyllablesTable = function (array_of_syllables, hiragana_length){
  console.log("-----------------table start");

  var syllables = array_of_syllables.slice();
  var yoko_index = 0; //------
  var tate_index = 0; //||||

  var table = [[]];

  while(syllables.length > 0){

    var syllable = findSyllablesByIndex(syllables, yoko_index);
    console.log(syllable);
    console.log("tate"+ tate_index);
    console.log("yoko"+ yoko_index);
    console.log("hiragana"+ hiragana_length);

    if(syllable){

      removeFromArray(syllables, syllable);

      table[tate_index].push(
        {
          cols:syllable.next_index - syllable.index,
          syllable:syllable
        }
      ); //update index
      yoko_index = syllable.next_index;

    }
    else{
      table[tate_index].push(
        {
          cols:1,
          syllable:null
        }
      );
      
      yoko_index ++;
    }


    if(yoko_index == hiragana_length && syllables.length > 0){
      table.push([]);
      tate_index ++;
      yoko_index = 0;
    }

  }


  //add padding to the end of table

  for(; yoko_index < hiragana_length; yoko_index++){
    table[tate_index].push(
      {
        cols:1,
        syllable:null
      }
    );
    

  }
  


  console.log("-----------------table finish");
  console.log("-----------------table finish");

  return table;
};

function findSyllablesByIndex(syllables, index){
  for(var i = 0; i < syllables.length; i++){
    if( syllables[i].index == index){
      return syllables[i];
    }
  }

  return null;
}

function removeFromArray(array, obj){
  //配列をループして値を照合して要素を削除
  for(i=0; i<array.length; i++){
    if(array[i] == obj){
      //spliceメソッドで要素を削除
      array.splice(i, 1);
    }
  }
}


// james -> JapaneseSound(じぇーむず,ジェームズ,james,"en")
atejilib.toJapaneseSound= function(name){
  return co(function*(){
    var lower_name = name.toLowerCase();
    try{
      var jap_sound_obj = yield atejilib.translateByDict(lower_name); //まずは辞書を探してみる
      return jap_sound_obj;
    }
    catch(err){
      console.log("辞書にはなかったようだ" + err);
    }

    try{
      var jap_sound = atejilib.translateAsRomaji(lower_name)

      return new JapaneseSound({
        hiragana:jap_sound,
        katakana:atejilib.hiraganasToKatakanas(jap_sound),
        original_name:lower_name,
        detected_lang:"ja"
      });
    }
    catch(err){
      console.log("ローマ字としての解釈もできない" + err);
    }

    throw Error("cannot translate");

  });
};


atejilib.romajiToJapaneseSound= function(name){
  return new Promise(function(resolve,reject){
    try{
      hiragana_str = atejilib.translateAsRomaji(name);
      var katakana_str = atejilib.hiraganasToKatakanas(hiragana_str);
      resolve(new JapaneseSound({
        hiragana:hiragana_str,
        katakana:katakana_str,
        original_name:name, 
        detected_lang:"ja"
      }));
    }
    catch(e){
      //ローマ字としての解釈失敗
      reject(e);
    }
  });
};


function JapaneseSound(hiragana,katakana,original_name,detected_lang)
{
  var that = this || {};

  if(typeof hiragana == "object"){
    var obj = hiragana;
    that.hiragana = obj.hiragana;
    that.katakana = obj.katakana;
    that.original_name = obj.original_name;
    that.detected_lang = obj.detected_lang;
    return that;
  }

  that.hiragana = hiragana;
  that.katakana = katakana;
  that.original_name = origin_name;
  that.detected_lang = detected_lang;

  return that;
}

atejilib.processJapanese = function (japanese_name){
  return co(function*(){
    console.log("processing japanese");
    var katakana_str,
         hiragana_str;

    if(atejilib.isKatakanas(japanese_name)){
      console.log("is katakana");
      katakana_str = japanese_name;
      hiragana_str = atejilib.katakanasToHiraganas(japanese_name.split("")).join('');

      return new JapaneseSound({
        hiragana: hiragana_str,
        katakana: katakana_str,
        original_name: japanese_name,
        detected_lang: "ja"
      });
    }
    else if(atejilib.isHiraganas(japanese_name)){
      console.log("is hiragana");
      hiragana_str = japanese_name;
      katakana_str = atejilib.hiraganasToKatakanas(japanese_name.split("")).join('');

      return new JapaneseSound({
        hiragana: hiragana_str,
        katakana: katakana_str,
        original_name: japanese_name,
        detected_lang: "ja"
      });
    }
    else if(atejilib.isAlphabets(japanese_name)){
      var alphabets = japanese_name;
      console.log("is alphabet");

      return atejilib.translateAsRomaji(alphabets);
    }
    else{
      console.log("is not hiragana katakana romaji");
      var error_message = "申し訳ありません"+ japanese_name +"様 <br> "+
        "既に漢字の名前をお持ちのようです。現在はひらがな・カタカナのみ対応しております。";
      throw new Error(error_message);
    }
  });
};

//@return object including array of meanings
//{kanji:"" , meanings:["", "",];
atejilib.meaningsOfKanji= function (kanji){
  var meanings = kanjis_meanings[kanji] || [];

  return {kanji:kanji, meanings:meanings};
};

atejilib.addMeaningToSyllables = function(syllables){
  for(var i = 0; i < syllables.length; i++){
    var syllable = syllables[i];
    var atejis = syllable.atejis; 
    syllable.atejis = [];

    for(var j = 0; j < atejis.length; j++){
      syllable.atejis.push(atejilib.meaningsOfKanji(atejis[j]));
    }
    
  }
  return syllables;
};

atejilib.addMeaningsToAtejis =function (atejis){
  _(atejis).each(function(ateji){
    ateji.meanings = atejilib.meaningsOfKanji(ateji.kanji).meanings; 
  });

  return;
};

atejilib.convertKanaToRomajiOfAtejis = function(atejis){
  _(atejis).each(function(ateji){
    ateji.kana = atejilib.hiraganaToRomaji(ateji.kana);
  });
};



