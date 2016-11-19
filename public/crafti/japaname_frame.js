(function(wind){ 
  var JapanameObject = wind.JapanameObject = {};
  var japanameFrame = null;
  var japanameFrameId = null;

  JapanameObject.onNameChange = function(fn){
    if(typeof fn === "function"){
      JapanameObject._nameChangeHandler = fn;
    }
  }

  JapanameObject.setJapanameFrameId = function(id){
    japanameFrameId = id;
  }

  wind.addEventListener("message",function(message){
    switch(message.data.type){
    case "name_change":
      if(JapanameObject._nameChangeHandler){
        JapanameObject._nameChangeHandler(message.data);
      }
      break;
    case "window_height":
      if(japanameFrameId){
        japanameFrame = document.getElementById(japanameFrameId);
        japanameFrame.height = message.data.height;
      }
      break;
    }
  },false);
}(window));

