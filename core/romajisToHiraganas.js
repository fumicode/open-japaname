var _ = require('underscore');


//returns array of hiragana
module.exports = function romajisToHiraganas(romaji_str){


  //終了記号を付け足しておく。
  romaji_str += ".";

  var state = "e";
  var hiraganas = "";
  var stack = "";

  //再帰になおしてもいいな。
  for(var i = 0; i < romaji_str.length; ){
    var alphabet = romaji_str[i];

    try{
      console.log(
          "     expect:["+state.split("").join(",")+"], \t" + 
          "stack:["+stack.split("").join(",")+"], \t"+
          "input:" + alphabet);
      var obj = stateMachine(state,alphabet, stack);
      var next_state = obj.next_state;
      var output = obj.output;
      var stack = obj.next_stack;

      //状態を更新
      state = next_state;

      //出力をつけたす
      if(output.length > 0){
        hiraganas += output;
      }
    }
    catch(e){
      console.log(e.stack);
      //とりあえず例外投げちゃう !!!!専用の例外作りたい 
      throw new Error("cannot parse romaji");
    }
    i++;
  }

  return hiraganas;
};

  //e:everything
  //c:consonant 子音 多分使わない？
  //v:vowel 母音
  //y:expecting y
  //h:expecting h
  //s:expecting s (after t)
  //vs: vowel or "s"
  //n: not sure n
  //=: expecting same char with last of stack
  //
  //

function strContains(string, chara){
  return string.indexOf(chara) != -1;
}
  
  
//{state, input} -> {next_state, output(, stack)}
function stateMachine(state, input, stack){
  //終了記号の場合
  var ret;


  if(input == "."){
    if(stack === "n"){
      return {
        next_state : "e", //ニュートラルにもどる。//もうどうでもいいけど
        output:"ん", //中途半端に終わってしまったnはんにしてあげる
        next_stack :"" //もうどうでもいいけど
      };
    }
    else{
      return {
        next_state : "e", //ニュートラルにもどる。//もうどうでもいいけど
        output:"", //健康に終了
        next_stack :"" //もうどうでもいいけど
      };
    }

    
    return;
  }
  //ニュートラルな状態の場合
  if(state === "e"){//strContains(state,"v") e は他との複合はありえない
    //母音の場合
    if(_.contains(vowels,input)){
      return {
        next_state : "e", //ニュートラルにもどる。//これは間違いない
        output:vowelToAgyo[input], //stack には何もないので、そのままア行を出す
        next_stack :""
      };
    }

    //子音の場合
    else if(_.contains(consonants,input)){
      var expectation = nextExpect[input];//array or undefined
      if(expectation){ //もしあれば
        return {
          next_state : "v=" + expectation.join(''), //!!!!ここで他の可能性 
          output:"", //何も出さない
          next_stack: input //stack + input
        };
      }
      //次の期待がなければ、母音か、連続だけが期待される
      else{
        return {
          next_state : "v=",  
          output:"", //何も出さない
          next_stack: input //stack + input
        };
      }
    }

    //母音でも子音でもない。
    else{
        throw new Error("invalid charactor" + input);
    }
  } //state e
  //n の状態が確定していなくて、母音でないとき
  else if(strContains(state,"n") && _.contains(consonants,input) ){
    //nだったら　＝　nが二回続いたら
    if(input === "n"){
      return {
        next_state : "e",  //ニュートラル
        output:"ん", //んで確定
        next_stack: ""//決定
      };
    }
    //その他の子音だったら
    else{ 
      //ここで終了して次にいく。
      //再帰呼び出ししちゃう。nに戻ってくることはないから許される
      ret = stateMachine("e", input, "");
      ret.output = "ん" + ret.output;
      return ret;
    }
  }
  //yが期待されてて、実際にyだったら
  else if(strContains(state,"y") && input == "y"){
    //cya とかtyaとかmyaなんだろう。
    return {
      next_state: "v", //つぎはマジで母音しかありえない
      output:"",
      next_stack :stack + "y" //sy
    };//

  }
  //hが期待されてて、実際にhだったら
  else if(strContains(state,"h") && input == "h"){
    //sha とかchaなんだろう。
    return {
      next_state: "v", //つぎはマジで母音しかありえない
      output:"",
      next_stack :stack+"h" //sh
    };//

  }
  else if(strContains(state,"s") && input == "s"){
    //ts行しかありえない。
    if(stack !== "t")
      throw new Error("おかしい。s状態ってことは、tsuのはず");

    return {
      next_state: "v", //つぎはマジで母音しかありえない ここに=とかだめだからな
      output:"",
      next_stack : stack+"s" //ts
    };//
  }

  //おなじ文字であることが期待されて、実際同じ文字だったとき
  //nnが続いてる場合については、前で処理しているので排除されている
  else if(strContains(state,"=") && stack.length > 0 && input === stack.slice(-1))
      //=と、hやyが共存しないことに依存している。
  {
      //再帰呼び出ししちゃう。nに戻ってくることはないから許される
      ret = stateMachine("e", input, "");
      ret.output = "っ" + ret.output;
      return ret;
  }

  //母音が期待されている状況で母音がきたら
  else if(strContains(state,"v") && _.contains(vowels,input)){
    //母音がきたら
    if(!stack){ //ア行だった
      stack = "a";
    }

    var index = vowelToIndex(input);
    if(index == -1) throw new Error("ありえない");

    var gogyo = consonantToHiragana[stack];
    if(!gogyo)  throw new Error(stack + " という子音はありません");

    var hiragana = gogyo[index];
    if(!hiragana) throw new Error(stack + " という子音に" + index + "バンめはありません。");

    return {
      next_state: "e", //ニュートラルな状態に戻る
      output:hiragana,
      next_stack :"" //スタックはリセットされる 
    };//
  }
  else{ 
    throw new Error("couldn't respond expectation" + input);
  }
}


var vowels = [
  "a",
  "i",
  "u",
  "e",
  "o"
];

function vowelToIndex(vowel){
  if(!_.contains(vowels, vowel)){
    throw new Error("should be vowel");
  }

  return vowels.indexOf(vowel);
}

var vowelToAgyo = {
  "a" : "あ",
  "i" : "い",
  "u" : "う",
  "e" : "え",
  "o" : "お"
};


//todo:二文字の子音も追加しなきゃ
var consonantToHiragana =  module.exports.hiraganasTable= {

  "a" :["あ",   "い",   "う",   "え",   "お"   ],
  "k" :["か",   "き",   "く",   "け",   "こ"   ],
  "c" :["か",   "き",   "く",   "け",   "こ"   ],
  "g" :["が",   "ぎ",   "ぐ",   "げ",   "ご"   ],
  "s" :["さ",   "し",   "す",   "せ",   "そ"   ],
  "z" :["ざ",   "じ",   "ず",   "ぜ",   "ぞ"   ],
  "j" :["じゃ", "じ",   "じゅ", "じぇ", "じょ" ],
  "t" :["た",   "ち",   "つ",   "て",   "と"   ],
  "d" :["だ",   "ぢ",   "づ",   "で",   "ど"   ],
  "n" :["な",   "に",   "ぬ",   "ね",   "の"   ],
  "h" :["は",   "ひ",   "ふ",   "へ",   "ほ"   ],
  "f" :["ふぁ", "ふぃ", "ふ",   "ふぇ", "ふぉ" ],
  "p" :["ぱ",   "ぴ",   "ぷ",   "ぺ",   "ぽ"   ],
  "b" :["ば",   "び",   "ぶ",   "べ",   "ぼ"   ],
  "m" :["ま",   "み",   "む",   "め",   "も"   ],
  "y" :["や",   "い",   "ゆ",   "え",   "よ"   ],
  "r" :["ら",   "り",   "る",   "れ",   "ろ"   ],
  "l" :["ら",   "り",   "る",   "れ",   "ろ"   ],   
  "w" :["わ",   "うぃ", "う",   "うぇ", "うぉ" ],

  "ky":["きゃ", "きぃ", "きゅ", "きぇ", "きょ" ],
  "gy":["ぎゃ", "ぎぃ", "ぎゅ", "ぎぇ", "ぎょ" ],
  "sh":["しゃ", "し",   "しゅ", "しぇ", "しょ" ],
  "sy":["しゃ", "し",   "しゅ", "しぇ", "しょ" ],
  "ch":["ちゃ", "ち",   "ちゅ", "ちぇ", "ちょ" ],
  "cy":["ちゃ", "ちぃ", "ちゅ", "ちぇ", "ちょ" ],
  "ty":["ちゃ", "ちぃ", "ちゅ", "ちぇ", "ちょ" ],
  "dy":["ぢゃ", "ぢぃ", "ぢゅ", "ぢぇ", "ぢょ" ],
  "th":["てゃ", "てぃ", "てゅ", "てぇ", "てょ" ],
  "py":["ぴゃ", "ぴぃ", "ぴゅ", "ぴぇ", "ぴょ" ],
  "ry":["りゃ", "りぃ", "りゅ", "りぇ", "りょ" ],
  "my":["みゃ", "みぃ", "みゅ", "みぇ", "みょ" ],
  "hy":["ひゃ", "ひぃ", "ひゅ", "ひぇ", "ひょ" ],
  "ts":["つぁ", "つぃ", "つ",   "つぇ", "つぉ" ],
  "zy":["じゃ", "じぃ", "じゅ", "じぇ", "じょ" ],
};


var nextExpect = {
  "s":['y','h' ],
  "c":['y','h' ],
  "t":['y','h','s'],
  "k":['y'],
  "p":['y'],
  "r":['y'],
  "m":['y'],
  "h":['y'],
  "z":['y'],
  "d":['y'],
  "g":['y'],
  "n":['n'],//nの行き先が確定してない状態 
  //ほかの子音でキャンセルされるか,なになるか,nでんになるか
};

var consonants = [
  "k", "c",
  "g",
  "s",
  "z",
  "j",
  "t",
  "d",
  "n",
  "h",
  "f",
  "p",
  "b",
  "m",
  "y",
  "r", "l",
  "w",
];

var everything = _.union(vowels,consonants);

