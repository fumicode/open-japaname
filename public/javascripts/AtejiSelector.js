class AtejiSelector{
  constructor(syllables, original_name){
    riot.observable(this);
    this.original_name = original_name;

    this.syllables = syllables;

    var twin = AtejiSelector.generateIndex2Sylls(this.syllables);
    this.index2Sylls = twin.index2Sylls ;
    this.index2SyllsRev = twin.index2SyllsRev;


    AtejiSelector.makeRef(this.syllables, this.index2Sylls);

    var route = AtejiSelector.shortestRoute(this.index2Sylls);

    this.usingSyllable = route[0];
    this.selectedSyllables= route;


  }

  getOriginalName(){
    return this.original_name;
  }

  getSelectedSyllables(){
    return this.selectedSyllables;
  }

  getUsingSyllable(){
    return this.usingSyllable;
  }

  useSyllable(syllable) {
    this.usingSyllable = syllable;

    this.trigger("kanjichanged",this.getCurrentKanjis());
  }

  useKanji(syllable, kanji){
    syllable.usingKanji = kanji;

    this.trigger("kanjichanged",this.getCurrentKanjis());
  }

  getCurrentKanjis(){
      return  _(this.selectedSyllables).map((syllable)=>{
          console.log(syllable.usingKanji);
      return {
        kanji: syllable.usingKanji.kanji,
        romaji: syllable.romaji,
        kana: syllable.kana,
        comment: syllable.usingKanji.comment,
        meanings: syllable.usingKanji.meanings,
      };
    });
  }


  changeSyllable(needed_syllable){
    this.selectedSyllables = AtejiSelector._changeSyllable(this.selectedSyllables, needed_syllable, this.index2Sylls)

  }

  getSubmitKanjis(e){
      var kanjis = _(this.getCurrentKanjis()).map(function(kanji){
          console.log(kanji);
      return {
        kana: kanji.kana ,
        kanji:kanji.kanji,
        comment:kanji.comment,
      }
    });
    return kanjis;
  }

    addCommentToKanji(syllable, comment){
        var syllable_exists = this.selectedSyllables.indexOf(syllable) != -1;
        if(syllable_exists){
          syllable.usingKanji.comment = comment ;
        }
        else{
            throw new Error("no syllable exist");
        }
    }

  static _changeSyllable(current_route, needed_syllable, index2Sylls){
    var needed_index = needed_syllable.index;
    var route_index= 0;
    var new_route = [];
    var next_index = 0;


    //必要音節にたどりつくまで、new_routeにpushしつづける
    while(!(next_index == needed_index)){
      new_route.push(current_route[route_index]);
      next_index = current_route[route_index].next_index;
      route_index ++;
    }
    //必要音節を、つなげた！
    new_route.push(needed_syllable);

    //後半のつなげ

    var lasting_index = needed_syllable.next_index;

    //次の候補
    var next_candidates = index2Sylls[lasting_index];

    //候補が存在する間
    while(next_candidates && next_candidates.length > 0){
      // 
      var next = _.intersection(next_candidates, current_route);

      if(next.length == 1){

        var syllable = next[0];
        var syllable_index = current_route.indexOf(syllable);

        new_route = new_route.concat(current_route.slice(syllable_index));
        break;
      }
      else if(next.length > 1){
        throw new Error("impossible!");
      }

      //if(next.length == 0){
      //適当に選ぶしかない
      //選び方はあとで
      var next_sillable = next_candidates[0];
      new_route.push(next_sillable);
      var next_candidates = index2Sylls[next_sillable.next_index];
    }

    return new_route;
  }

  static getOtherSylls(syll, index2Sylls){
    var sylls = index2Sylls[syll.index];//array of sylls inclucing syll

    var next_index = syll.next_index;//ここに届かなければ
    var i = sylls.indexOf(syll);
    var otherSylls = sylls.slice(0,i).concat(sylls.slice(i+1,sylls.legnth));

    otherSylls = _(otherSylls).map((syll)=>{
      var path = [syll];
      var syllable = syll;
      
      while(!(syllable.next_index >= next_index)){
        syllable = index2Sylls[syllable.next_index][0];
        path.push(syllable);
      }
      
      return path;
    })


    return otherSylls;
  }

  static generateIndex2Sylls(syllables){
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

  static randomRoute(index2Sylls){
    var route = [];
    var index = 0;
    while(index < index2Sylls.length){
      var sylls = index2Sylls[index];
      var selected_i = Math.floor(Math.random() * sylls.length);
      var syll = sylls[selected_i];
      route.push(syll);
      index = syll.next_index;
    }
    return route;
  }

  static shortestRoute(index2Sylls){
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

  static longestRoute(index2Sylls){
    var route = [];
    var index = 0;
    while(index < index2Sylls.length){
      var sylls = index2Sylls[index];
      var min_next_index = 100; //tekito-
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


  static makeRef(syllables, index2Sylls){ //あとでのために、kanjiに自分の親を覚えさせる
    //すべての音節に対して
    for(var i in  syllables){
      var syllable = syllables[i];

      //すべての漢字に
      for(var j in  syllable.atejis){
        var kanji = syllable.atejis[j];
        //自分の親を覚えさせておく
        kanji.parent_syllable = syllable; //循環参照注意
      }

      var siblings = AtejiSelector.getOtherSylls(syllable, index2Sylls);

      syllable.siblings = siblings;

      syllable.usingKanji = syllable.atejis[0];
    }
  }
}
