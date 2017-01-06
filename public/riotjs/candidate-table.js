
riot.tag2('candidate-table', '<div class="syllablesTable"> <div class="syllablesTable__item {syllable == usingSyllable ? \'syllablesTable__item--using\':\'\'}" each="{syllable in selectedSyllables}" onclick="{parent.syllableSelected}" ontouchstart="{parent.syllableSelected}"> <h3 class="syllablesTable__head">{syllable.romaji} - {syllable.kana}</h3> <div class="syllablesTable__kanjis"> <table class="kanjisList"> <tr class="kanjisList__row"> <td class="kanjisList__item" each="{kanji in syllable.atejis}"> <div class="kanjiCell {kanji == syllable.usingKanji ? \'kanjiCell--using\':\'\'}" onclick="{parent.parent.kanjiSelected}"> <div class="kanjiCell__char">{kanji.kanji}</div> <div class="kanjiCell__meanings">{kanji.meanings.join(⁗\\n⁗)}</div> </div> </td> <td class="kanjisList__item" each="{other_syllable_path in syllable.siblings}" onclick="{parent.parent.changeSyllable}"> <div class="otherSyllableCell"> <div class="otherSyllableCell__part" each="{other_syllable in other_syllable_path}">{other_syllable.romaji}<span each="{kanji in other_syllable.atejis.slice(0,3)}">{kanji.kanji}</span></div> </div> </td> </tr> </table> </div> </div> </div>', '', '', function(opts) {
    this_tag = this;
    this.atejiSelector = opts.ateji_selector;

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

    this.changeSyllable = function(e){
      this.atejiSelector.changeSyllable(e.item.other_syllable_path[0]);
    }.bind(this)
});