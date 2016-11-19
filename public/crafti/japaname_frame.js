(function(wind){ 
  var japanameFrame = null;
  var japanameFrameId = null;

  var JapanameObject = wind.JapanameObject = {
    //名前が変更になったときの関数を登録する
    onNameChange : function(fn){
      if(typeof fn === "function"){
        JapanameObject._nameChangeHandler = fn;
      }
      else{
        throw new Error("the argument of onNameChange must be function.");
      }
    },
    //iframeのIDをセットする
    setJapanameFrameId : function(id){
      japanameFrameId = id;
    },
    changeName:function(name){
      var url = "http://japaname.jp/names/api/" + encodeURIComponent(name);
      japanameIframe.src = url;
    }

  };

  wind.addEventListener("message",function(message){
    switch(message.data.type){
    case "name_change":
      if(JapanameObject._nameChangeHandler){
        JapanameObject._nameChangeHandler(message.data);
      }
      break;

    case "window_height":

      japanameFrame = document.getElementById(japanameFrameId)
      if(japanameFrame){
        japanameFrame.height = message.data.height;
      }
      else{
        throw new Error("Please set valid iframe id");
      }  
      break;
    }

  },false);
}(window));

