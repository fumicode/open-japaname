
riot.tag2('selecting-bar', '<div class="selectingKanji {ontop ? \'selectingKanji--ontop\':\'\'}"> <div class="selectingKanji__container"> <div class="selectingKanji__col--box" onclick="{toggle}"> <div class="horizonScroller"> <ul class="namesContainer"> <li class="namesContainer__cell" each="{name in opts.names_selector}"> <h4 class="atejiBox__original">{name.original_name} &raquo; </h4> <japaname-box ateji_selector="{name.atejiSelector}" show_meanings="{opts.showMeanings}"></japaname-box> </li> </ul> </div> </div> <div class="selectingKanji__col--button"> <gonext-button center="{false}" names_selector="{opts.names_selector}"></gonext-button> </div> </div> </div>', '', '', function(opts) {
    this.ontop = true;

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