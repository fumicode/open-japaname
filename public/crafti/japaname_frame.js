(function(wind){ 
  var japanameFrame = null;
  var japanameFrameId = null;
  var nameChangeHandler = function(){};
  var nameNotFoundHandler= function(){};

  var JapanameObject = wind.JapanameObject = {
    //名前が変更になったときの関数を登録する
    onNameChange : function(fn){
      if(typeof fn === "function"){
        nameChangeHandler = fn;
      }
      else{
        throw new Error("the argument of onNameChange must be function.");
      }
    },
    onNameNotFound:function(fn){
      if(typeof fn === "function"){
        nameNotFoundHandler = fn;
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
      var url = "http://japaname.jp/api/crafti/names/" + encodeURIComponent(name);

      japanameFrame = document.getElementById(japanameFrameId)
      if(japanameFrame){
        japanameFrame.src = url;
      }
      else{
        throw new Error("Please set valid iframe id");
      }  
    }

  };

  wind.addEventListener("message",function(message){
    switch(message.data.type){
    case "name_change":
      if(nameChangeHandler){
        nameChangeHandler(message.data);
      }
      break;

    case "name_not_found":


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

