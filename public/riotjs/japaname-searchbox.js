
riot.tag2('japaname-searchbox', '<form class="jnSearchBox" role="search" method="get" action="/names/candidates/" riot-style="font-size:{opts.font_size ||\'3rem\'};height:{opts.height || \'5rem\'}"> <button class="jnSearchBox__button" type="submit" name="japaname_search_button" onfocus="{buttonFocused}">{opts.button || ⁗Go!⁗}</button> <input class="jnSearchBox__textbox" id="original_name" name="original_name" type="search" placeholder="{opts.placeholder || \'Enter Your Name\'}" riot-value="{opts.text || \'\'}" onfocus="{opts.onfocus}" onblur="{opts.onblur}"> </form>', '', '', function(opts) {
    console.log(opts);

    if(opts.focus){
      window.onload = function(){
        this.original_name.focus();
      }
    }

    this.buttonFocused = function(e){
      this.japaname_search_button.click();
    }.bind(this)
});