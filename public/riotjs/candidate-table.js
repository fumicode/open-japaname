
riot.tag2('candidate-table', '<table class="syllablesTable"> <tbody each="{syllable in selectedSyllables}" onclick="{parent.syllableSelected}"> <tr class="syllablesTable__headRow {syllable == usingSyllable ? \'syllablesTable__headRow--using\':\'\'}"> <th class="syllablesTable__headCell">{syllable.romaji} - {syllable.kana}</th> </tr> <tr class="syllablesTable__kanjisRow {syllable == usingSyllable ? \'syllablesTable__headRow--using\':\'\'}"> <td class="syllablesTable__kanjisCell"> <table class="kanjisList"> <tr class="kanjisList__row"> <td class="kanjisList__item" each="{kanji in syllable.atejis}"> <div class="kanjiCell {kanji == syllable.usingKanji ? \'kanjiCell--using\':\'\'}" onclick="{parent.parent.kanjiSelected}">{kanji.kanji} <div class="kanjiCell__meanings">{kanji.meanings.join(⁗\\n⁗)}</div> </div> </td> <td class="kanjisList__item" each="{other_syllable in syllable.siblings}" onclick="{parent.parent.changeSyllable}"> <div class="otherSyllableCell">{other_syllable.romaji} <div each="{kanji in other_syllable.atejis.slice(0,3)}">{kanji.kanji}</div> </div> </td> </tr> </table> </td> </tr> </tbody> </table>', '', '', function(opts) {
    this_tag = this;

    this.syllables = opts.syllables;

    var twin = generateIndex2Sylls(this.syllables);
    this.index2Sylls = twin.index2Sylls ;
    this.index2SyllsRev = twin.index2SyllsRev;

    makeRef(this_tag.syllables, this.index2Sylls);

    var route = shortestRoute(this.index2Sylls);

    this_tag.usingSyllable = route[0];
    this_tag.selectedSyllables= route;

    this.fugas = [1,3,2];

    function getOtherSylls(syll, index2Sylls){
      var sylls = index2Sylls[syll.index];
      var i = sylls.indexOf(syll);
      var otherSylls = sylls.slice(0,i).concat(sylls.slice(i+1,sylls.legnth));
      return otherSylls;
    }

    this.on("update", function(){

    });

    this.syllableSelected = function(e){
      this_tag.usingSyllable = e.item.syllable;
    }.bind(this)

    this.kanjiSelected = function(e){
      var syllable = e.item.kanji.parent_syllable;
      syllable.usingKanji = e.item.kanji;

    }.bind(this)

    this.changeSyllable = function(e){
      var needed_syllable = e.item.other_syllable;
      this.selectedSyllables  = changeSyllable(this.selectedSyllables ,needed_syllable ,this.index2Sylls);
    }.bind(this)

    function changeSyllable(current_route, needed_syllable, index2Sylls){
      var needed_index = needed_syllable.index;
      var route_index= 0;
      var new_route = [];
      var next_index = 0;

      while(!(next_index == needed_index)){
        new_route.push(current_route[route_index]);
        next_index = current_route[route_index].next_index;
        route_index ++;
      }

      new_route.push(needed_syllable);

      var lasting_index = needed_syllable.next_index;

      var next_candidates = index2Sylls[lasting_index];

      while(next_candidates && next_candidates.length > 0){

        var next = _.intersection(next_candidates, current_route);

        if(next.length == 1){
          console.log("sameas current route");

          var syllable = next[0];
          console.log(syllable);
          var syllable_index = current_route.indexOf(syllable);

          new_route = new_route.concat(current_route.slice(syllable_index));
          break;
        }
        else if(next.length > 1){
          throw new Error("impossible!");
        }

        var next_sillable = next_candidates[Math.floor(Math.random() * next_candidates.length)];
        new_route.push(next_sillable);
        var next_candidates = index2Sylls[next_sillable.next_index];
      }

      return new_route;
    }

    function generateIndex2Sylls(syllables){
      var index2Sylls= [];
      var index2SyllsRev= [];
      for(var i in syllables){
        var syll = syllables[i];

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

    function shortestRoute(index2Sylls){
      var route = [];
      var index = 0;
      while(index < index2Sylls.length){
        var sylls = index2Sylls[index];

        var min_next_index = 100;
        var min_next = null;
        for(var syll_i in sylls){
          if(sylls[syll_i].next_index <= min_next_index){
            min_next_index = sylls[syll_i].next_index;
            min_next = sylls[syll_i];
          }
        }

        var syll = min_next;
        route.push(syll);
        index = syll.next_index;
      }
      return route;
    }

    function makeRef(syllables, index2Sylls){

      for(var i in  syllables){
        var syllable = syllables[i];

        for(var j in  syllable.atejis){
          var kanji = syllable.atejis[j];

          kanji.parent_syllable = syllable;
        }

        var siblings = getOtherSylls(syllable, index2Sylls);

        syllable.siblings = siblings;

        syllable.usingKanji = syllable.atejis[0];
      }
    }
});