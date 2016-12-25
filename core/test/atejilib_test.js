
var atejilib = require("../atejilib.js");


function testJapaneseSound(original_name ){

  console.log(original_name);

  atejilib.toJapaneseSound(original_name)
    .then((name_obj)=>{
    console.log("found " +  original_name + " " + name_obj.hiragana + " " + name_obj.katakana);

  }).catch((err)=>{
    console.log("err " + err + " " + original_name);
  });

}

testJapaneseSound("james");

testJapaneseSound("Michael bond");

testJapaneseSound("hogehog");
testJapaneseSound("man");
testJapaneseSound("mash");
testJapaneseSound("mark");
testJapaneseSound("micky");

testJapaneseSound("ひらがな");




/*
var hogehoge = atejilib.translateAsRomaji("hogehoge");
console.log(hogehoge);
*/
