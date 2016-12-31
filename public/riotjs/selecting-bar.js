
riot.tag2('selecting-bar', '<div class="selectingKanji"> <div class="selectingKanji__container"> <div class="selectingKanji__col--box"> <yield from="content"></yield> </div> <div class="selectingKanji__col--button"> <button class="goNextButton">&raquo;Go<br>Next!</button> </div> </div> </div>', '', '', function(opts) {
    console.log("selecting bar mounting");
    console.log(opts);
});