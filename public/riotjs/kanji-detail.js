
riot.tag2('kanji-detail', '<div class="kanjiDetail {opened ? \'kanjiDetail--opened\':\'\'}"> <div class="kanjiDetail__inner"> <div class="kanjiDetail__leftColumn"> <div class="kanjiDetail__bigKanji"> <span class="kanjiDetail__bigKanjiInner">{thekanji} </span></div> </div> <div class="kanjiDetail__centerColumn"> <div class="kanjiDetail__sounds"> <virtual each="{sound in romaji_sounds}">[{sound}]</virtual> </div> <div class="kanjiDetail__meaning">{meaning}</div> <p>{kanji.comment}</p> </div> <div class="kanjiDetail__rightColumn"> <form onsubmit="{addComment}"> <textarea rows="3" style="width:80%" ref="comment_input"></textarea> <input type="submit" value="コ メ ン ト を 追 加"> </form> </div> </div> </div>', '', '', function(opts) {
    this.atejiSelector = opts.ateji_selector;
    this.currentSyllable = opts.current_syllable;
    this.favoriteKanjis = opts.favoriteKanjis;

    this.kanji = this.atejiSelector.getCurrentKanjiInSyllable(this.currentSyllable)

    var this_tag = this;

    this.atejiSelector.on("kanjichanged",function(){
      this_tag.update();
    });

    this.on("update",function(){
      this.kanji = this.atejiSelector.getCurrentKanjiInSyllable(this.currentSyllable)

      if(this.kanji){
        this.thekanji = this.kanji.kanji;
        this.meaning = this.kanji.meanings[0];
        this.romaji_sounds = this.kanji.romaji_sounds;
        this.opened = true;
      }
      else{
        this.opened = false;
      }
    });

    this.addComment = function(e){
      var comment_text = this.refs.comment_input.value;
      this.atejiSelector.addCommentToKanji(this.currentSyllable, comment_text);
      this.refs.comment_input.value = "";
      this.update();
      e.preventDefault();
    }.bind(this)

    var this_tag = this;

    this.selectKanji=function(kanji){
      this.kanji = kanji;
      this.update();
    }

    this.favorite = function(e){
      this.favoriteKanjis.toggle();
    }.bind(this)
});