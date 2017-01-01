
riot.tag2('selecting-bar', '<div class="selectingKanji {ontop ? \'selectingKanji--ontop\':\'\'}"> <div class="selectingKanji__container"> <div class="selectingKanji__col--box" onclick="{toggle}"> <div class="horizonScroller"> <table class="namesContainer"> <tr class="namesContainer__row"> <td class="namesContainer__cell"> <p class="selectingKanji__original">{opts.original_name} &raquo; </p> <japaname-box ateji_selector="{opts.atejiSelector}" show_meanings="{opts.showMeanings}"></japaname-box> </td> </tr> </table> </div> </div> <div class="selectingKanji__col--button"> <gonext-button center="{false}"></gonext-button> </div> </div> </div>', '', '', function(opts) {
    this.ontop = true;
    this.on("mount",function(){

    });

    var this_tag = this;

    window.onscroll = function(){
      var scrollTop = window.pageYOffset;
      if(scrollTop != 0){
        this_tag.ontop = true;
      }
      else{
        this_tag.ontop = false;
      }
      this_tag.update();
    }

    this.open = function(){
      this.ontop = false;
      window.scrollTo(0,0);
    }.bind(this)

    this.close = function(){
      this.ontop = true;
      window.scrollTo(0,1);
    }.bind(this)

    this.toggle = function(){
      if(this.ontop){
        this.open();
      }
      else{
        this.close();
      }
    }.bind(this)
});