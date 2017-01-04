class NamesSelector extends Array{
  /*
  [{
    original_name:string,
    hiragana:string,
    katakana:string,
    hiragana_nosmall:string,
    syllables:[syllable],
  }];
  */

  constructor(names){
    super(names.length);
    this.names = names;

    for(var i = 0 ; i < this.names.length; i ++){
      var name = this.names[i];
      this.names[i].atejiSelector = new AtejiSelector(name.syllables, name.original_name);

      this[i] = this.names[i];
    }


    /*
    this.length = this.names.length;

    for(var i = 0 ; i < this.length; i ++){
      this[i] = names[i];
      this[i].atejiSelector = new AtejiSelector(name.syllables, name.original_name);

    }
    */
    
  }

  getAtejiSelector(index){
    return this.names[index].atejiSelector;
  }

  getOriginalName(index){
    return this.names[index].original_name;
  }
}
