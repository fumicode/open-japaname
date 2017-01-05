
riot.tag2('japaname-box', '<table class="atejiBox"> <col class="atejiBox__col {syllable == usingSyllable ? \'atejiBox__col--using\':\'\'}" each="{syllable in syllables}" span="1"> <tbody> <tr class="atejiBox__line"> <td class="atejiBox__cell atejiBox__cell--kana" each="{ji in atejis}">{ji.romaji} </td> </tr> <tr class="atejiBox__line"> <td class="atejiBox__cell atejiBox__cell--kanji" each="{ji in atejis}">{ji.kanji} </td> </tr> <tr class="atejiBox__line" if="{showMeanings}"> <td class="atejiBox__cell atejiBox__cell--meanings" each="{ji in atejis}">{ji.meanings[0]} <virtual each="{meaning in ji.meanings}">{meaning}<br></virtual> </td> </tr> </tbody> </table>', '', '', function(opts) {
    this.atejiSelector = opts.ateji_selector;

    this.showMeanings = opts.show_meanings === undefined ? true:!!opts.show_meanings;

    this.atejis = this.atejiSelector.getCurrentKanjis();

    this.syllables = this.atejiSelector.getSelectedSyllables();
    this.usingSyllable = this.atejiSelector.getUsingSyllable();

    var this_tag = this;
    this.atejiSelector.on("kanjichanged",function(atejis){
      this_tag.atejis = atejis;
      this_tag.update();
    });

    this.on("update",function(){
      this.syllables = this.atejiSelector.getSelectedSyllables();
      this.usingSyllable = this.atejiSelector.getUsingSyllable();
    });
});