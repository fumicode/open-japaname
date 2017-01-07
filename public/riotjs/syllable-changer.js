
riot.tag2('syllable-changer', '<div class="syllableChanger" if="{opened}" riot-style="top:{y}px; left:{x}px" onclick="{OKPushed}"> <p class="syllableChanger__sentence">Change syllable separation?</p> <ul> <li each="{syllable in syllable_path}">{syllable.romaji}<span each="{kanji in syllable.atejis.slice(0,3)}">{kanji.kanji}</span></li> </ul> <div class="syllableChanger__buttonsContainer"> <button class="syllableChanger__changeButton" onclick="{OKPushed}">OK</button> <button class="syllableChanger__cancelButton" onclick="{hide}">Cancel</button> </div> </div>', '', '', function(opts) {
    var this_tag = this;
    this.from_syllable = opts.from_syllable;
    this.syllable_path = opts.syllable_path;
    this.opened = false;
    this.onOK = opts.onOK;
    this.x = 0;
    this.y = 0;

    this.on("update",function(){
      if(this.opened){
        this.addBodyEvent();
      }
      else{
        this.removeBodyEvent();
      }

    });

    this.addBodyEvent = function(){
      var body = document.getElementsByTagName("body")[0];
      body.addEventListener("click",this_tag.bodyEventListener)

    }

    this.removeBodyEvent = function(){
      var body = document.getElementsByTagName("body")[0];
      body.removeEventListener("click",this_tag.bodyEventListener)
    }

    this.bodyEventListener = function(){
      this_tag.update({opened:false});
    }

    this.hide = function(e){
      this.opened=false;
    }.bind(this)

    this.OKPushed = function(e){
      if(this.onOK && typeof this.onOK ==="function"){
        this.onOK(this.syllable_path);
      }

      e.stopPropagation();
    }.bind(this)
});