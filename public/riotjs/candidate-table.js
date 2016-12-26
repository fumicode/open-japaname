
riot.tag2('candidate-table', '<table class="syllablesTable"> <tbody each="{syllable in selectedSylls}" onclick="{parent.syllableSelected}"> <tr class="syllablesTable__headRow {syllable == usingSyllable ? \'syllablesTable__headRow--using\':\'\'}"> <th class="syllablesTable__headCell">{syllable.romaji} - {syllable.kana}</th> </tr> <tr class="syllablesTable__kanjisRow {syllable == usingSyllable ? \'syllablesTable__headRow--using\':\'\'}"> <td class="syllablesTable__kanjisCell"> <table class="kanjisList"> <tr class="kanjisList__row"> <td class="kanjisList__item" each="{kanji in syllable.atejis}"> <div class="kanjiCell {kanji == syllable.usingKanji ? \'kanjiCell--using\':\'\'}" onclick="{parent.parent.kanjiSelected}">{kanji.kanji} <div class="kanjiCell__meanings">{kanji.meanings.join(⁗\\n⁗)}</div> </div> </td> </tr> </table> </td> </tr> </tbody> </table>', '', '', function(opts) {
    this_tag = this;
    this.syllables = opts.syllables;

    makeRef(this_tag.syllables);

    var twin = generateIndex2Sylls(this.syllables);
    this.index2Sylls = twin.index2Sylls ;
    this.index2SyllsRev = twin.index2SyllsRev;

    var route = randomRoute(this.index2Sylls);

    this_tag.usingSyllable = route[0];
    this_tag.selectedSylls= route;

    this.otherSylls =  function (syll){
      var sylls = index2Sylls[syll.index];

      var i = sylls.indexOf(syll);
      var orherSylls = sylls.splice(i,1);
      return otherSylls;
    }

    this.on("update", function(){

    });

    this.syllableSelected = function(e){
      this_tag.usingSyllable = e.item.syllable;
    }.bind(this)

    this.kanjiSelected = function(e){
      var syllable = e.item.kanji.parent_syllable;
      console.log(syllable);
      syllable.usingKanji = e.item.kanji;

    }.bind(this)

    function generateIndex2Sylls(syllables){
      var index2Sylls= [];
      var index2SyllsRev= [];
      for(var i in syllables){
        var syll = syllables[i];
        console.log(syll + "z");

        if(!index2Sylls[syll.index]){
          index2Sylls[syll.index] = [];
        }
        index2Sylls[syll.index].push(syll);

        if(!index2SyllsRev[syll.next_index-1]){
          index2SyllsRev[syll.next_index-1] = [];
        }
        index2SyllsRev[syll.next_index-1].push(syll);
      }

      return {
        index2Sylls,
        index2SyllsRev
      }
    }

    function randomRoute(index2Sylls){
      var route = [];
      var index = 0;
      while(index < index2Sylls.length){
        var sylls = index2Sylls[index];
        var selected_i= Math.floor(Math.random() * sylls.length);
        var syll = sylls[selected_i];
        route.push(syll);
        index = syll.next_index;
      }
      return route;
    }

    function shortestRoute(index2Sylls){
      var route = [];
      var index = 0;
      while(index < index2Sylls.length){
        var sylls = index2Sylls[index];

        var max_next_index = index;
        var max_next = null;
        for(var syll_i in sylls){
          if(sylls[syll_i].next_index > max_next){
            max_next_index = sylls[syll_i].next_index;
            max_next = sylls[syll_i];
          }
        }

        var syll = max_next;
        route.push(syll);
        index = syll.next_index;
      }
      return route;
    }

    function makeRef(syllables){
      for(var i in  syllables){
        var syllable = syllables[i];
        for(var j in  syllable.atejis){
          var kanji = syllable.atejis[j];
          kanji.parent_syllable = syllable;
        }
        syllable.usingKanji = syllable.atejis[0];
      }
    }
});