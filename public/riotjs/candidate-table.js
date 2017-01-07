
riot.tag2('candidate-table', '<div class="syllablesTable"> <div class="syllablesTable__item {syllable == usingSyllable ? \'syllablesTable__item--using\':\'\'}" each="{syllable in selectedSyllables}" onclick="{parent.syllableSelected}" ontouchstart="{parent.syllableSelected}"> <h3 class="syllablesTable__head">{syllable.romaji} - {syllable.kana}</h3> <div class="syllablesTable__kanjis"> <table class="kanjisList"> <tr class="kanjisList__row"> <td class="kanjisList__item" each="{other_syllable_path in syllable.siblings}"> <div class="otherSyllableCell" onclick="{openSepButton}"> <ul> <li class="otherSyllableCell__part" each="{other_syllable in other_syllable_path}">{other_syllable.romaji}</li> </ul> </div> </td> <td class="kanjisList__item" each="{kanji in syllable.atejis}"> <div class="kanjiCell {kanji == syllable.usingKanji ? \'kanjiCell--using\':\'\'}" onclick="{parent.parent.kanjiSelected}"> <div class="kanjiCell__char">{kanji.kanji}</div> <div class="kanjiCell__meanings">{kanji.meanings.join(⁗\\n⁗)}</div> </div> </td> </tr> </table> </div> </div> </div>', '', '', function(opts) {
    this_tag = this;
    this.atejiSelector = opts.ateji_selector;
    this.syllableChanger = opts.syllable_changer;
    console.log("this.syllableChanger ");
    console.log(this.syllableChanger );

    this.selectedSyllables = this.atejiSelector.getSelectedSyllables();
    this.usingSyllable = this.atejiSelector.getUsingSyllable();

    this.on("update",function(){
      this.selectedSyllables = this.atejiSelector.getSelectedSyllables();
      this.usingSyllable = this.atejiSelector.getUsingSyllable();
    });

    this.syllableSelected = function(e){
      this.atejiSelector.useSyllable(e.item.syllable);
    }.bind(this)

    this.kanjiSelected = function(e){
      var syllable = e.item.kanji.parent_syllable;
      var kanji = e.item.kanji;

      this.atejiSelector.useKanji(syllable, kanji);
    }.bind(this)

    this.openSepButton = function(e){

      var syllableChanger = this.syllableChanger;

      console.log("open sep button");

      syllableChanger.update({

        syllable_path:e.item.other_syllable_path,
        opened:true,
        x: e.pageX,
        y: e.pageY,
        onOK:function(syllable_path){
          this_tag.atejiSelector.changeSyllable(syllable_path[0]);
          this_tag.update();

          syllableChanger.update({ opened:false});
        }
      });
      e.stopPropagation();
    }.bind(this)
});