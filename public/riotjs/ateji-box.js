
riot.tag2('ateji-box', '<col class="atejiBox__col" each="{ji in atejis}" span="1"> <tbody> <tr class="atejiBox__line"> <td class="atejiBox__cell atejiBox__cell--kana" each="{ji in atejis}">{ji.romaji} </td> </tr> <tr class="atejiBox__line"> <td class="atejiBox__cell atejiBox__cell--kanji" each="{ji in atejis}">{ji.kanji} </td> </tr> <tr class="atejiBox__line"> <td class="atejiBox__cell atejiBox__cell--meanings" each="{ji in atejis}">{ji.meanings[0]} </td> </tr> </tbody>', '', 'class="atejiBox"', function(opts) {
    this.atejis = opts.atejis || [];

    this.on("update",function(){
      console.log("hy");
      console.log(this.atejis);
    });
});