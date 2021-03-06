(function(wind){ 
  var japaname_jp = "japana.me";//送るときに入れ替えてもらえる。by router
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
      var url = "https://"+japaname_jp+"/api/crafti/names/" + encodeURIComponent(name);


      japanameFrame = document.getElementById(japanameFrameId)
      if(japanameFrame){
        japanameFrame.src = url;
      }
      else{
        throw new Error("Please set valid iframe id");
      }  
    },
    saveJapaname:function(obj){
      return $.ajax({
        type:"POST",
        url:"https://"+japaname_jp+"/api/core/names",
        data:{
          //old
          original_name: obj.original_name,
          ateji:JSON.stringify( obj.atemojis), //名前か得体
          res_json:"true"
        }
      });
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

