
riot.tag2('candidate-table', '<table class="syllablesTable"> <tbody each="{syllable in selectedSyllables}" onclick="{parent.syllableSelected}"> <tr class="syllablesTable__headRow {syllable == usingSyllable ? \'syllablesTable__headRow--using\':\'\'}"> <th class="syllablesTable__headCell">{syllable.romaji} - {syllable.kana}</th> </tr> <tr class="syllablesTable__kanjisRow {syllable == usingSyllable ? \'syllablesTable__kanjisRow--using\':\'\'}"> <td class="syllablesTable__kanjisCell"> <table class="kanjisList"> <tr class="kanjisList__row"> <td class="kanjisList__item" each="{kanji in syllable.atejis}"> <div class="kanjiCell {kanji == syllable.usingKanji ? \'kanjiCell--using\':\'\'}" onclick="{parent.parent.kanjiSelected}"> <div class="kanjiCell__char">{kanji.kanji}</div> <div class="kanjiCell__meanings">{kanji.meanings.join(⁗\\n⁗)}</div> </div> </td> <td class="kanjisList__item" each="{other_syllable_path in syllable.siblings}" onclick="{parent.parent.changeSyllable}"> <div class="otherSyllableCell"> <div class="otherSyllableCell__part" each="{other_syllable in other_syllable_path}">{other_syllable.romaji}<span each="{kanji in other_syllable.atejis.slice(0,3)}">{kanji.kanji}</span></div> </div> </td> </tr> </table> </td> </tr> </tbody> </table>', '', '', function(opts) {
    this_tag = this;
    console.log(opts);
    this.atejiSelector = opts.atejiSelector;

    this.selectedSyllables = atejiSelector.getSelectedSyllables();
    this.usingSyllable = atejiSelector.getUsingSyllable();

    this.on("update",function(){
      this.selectedSyllables = atejiSelector.getSelectedSyllables();
      this.usingSyllable = atejiSelector.getUsingSyllable();
      console.log("hello");
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