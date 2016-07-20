
//画像に幅とか考えた上でテキストをおく
this['compositeIconName'] = function(canvas, image, name, fontname){

  return new Promise(function(resolve, reject){

  console.log("hello " + name + " san");
  var c = canvas.getContext("2d");

  var margin = 10;
  var nameBoxWidth = canvas.width - margin * 2;

  c.drawImage(image, 0,0,canvas.width,canvas.height);
  {

    c.font = "100px serif";
    //c.font = "100px '"+fontname+"'";

    var textMetrix = c.measureText(name);
    var ratio = nameBoxWidth / textMetrix.width;
    var textHeight = 100 * ratio;

    var boxHeight = canvas.height/4;
    if(textHeight > boxHeight){ //もうすこしきれいに記述できそうではある。
      textHeight = boxHeight;
      ratio = textHeight / 100;
    }


    c.fillStyle = "rgba(255,255,255,0.80)";
    c.fillRect(0,canvas.height, canvas.width, - (margin*3 + textHeight )); //フォントがうまくいかないから仕方なく。


    c.save();
      c.translate(canvas.width/2, canvas.height- margin);
      c.scale(ratio,ratio);

      //c.strokeStyle = "rgb(255,255,255)";
      //c.lineWidth = 5;
      //c.strokeText(name,10,280);

      c.fillStyle = "rgb(0,0,0)";
      c.textAlign = "center";
      //c.textBaseline = "ideographic"; //なんか思い通りにいかないなあ。フォントがいけないのか？
      c.fillText(name,0,0);

      c.fillRect(-10,0,20,-100);
    c.restore();


    c.fillStyle = "#d4371c";
    c.fillRect(0,canvas.height, canvas.width, - margin/2);
    resolve(canvas);
  }

  });

}



//!!!! client side function
this['loadFont'] = function loadFont(fontname){
  console.log("loading font " + fontname);
  return new Promise(function(resolve,reject){

    //リトライ回数
    var cnt = 0;
    function tryDraw(){
      if(!loaded() && cnt<30){
        console.log("not loaded");
        setTimeout(tryDraw, 100);
        cnt++;
      }else{
        if(cnt >= 30){
          reject(Error("couldn't load font"));
          return;
        }
        console.log("loaded !");
        resolve();
      }
    }

    //webフォントのロード状況を確認する
    var c1 = document.createElement("canvas");
    var c2 = c1.cloneNode(false);
    var ctx1 = c1.getContext("2d");
    var ctx2 = c2.getContext("2d");
    console.log(ctx1 + " " +  ctx2);
    //webフォントと代替フォントとを指定．
    //NOTE:monoscopeだとwebkitでリロード時に失敗する
    ctx1.font = "normal 30px '"+fontname+"', serif";
    ctx2.font = "normal 30px serif";
    var text = "this is test text.";  

    function loaded(){
      //テキスト幅を比較する
      //webフォントが利用可能となると，フォント幅が一致する．
      var tm1 = ctx1.measureText(text);
      var tm2 = ctx2.measureText(text);

      console.log("tm " + tm1.width + " " + tm2.width);
      return tm1.width != tm2.width;
    }

    tryDraw();

  });
}

