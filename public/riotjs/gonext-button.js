
riot.tag2('gonext-button', '<form id="gonext-form" ref="gonext_form" method="POST" action="/names"> <input type="hidden" ref="names_input" name="names" value=""> </form> <button class="goNextButton {opts.center ? \'goNextButton--center\' :\'\'}" onclick="{registerAteji}">&raquo;Go<br>Next!</button>', '', '', function(opts) {
    var this_tag = this;
    this.namesSelector  = opts.names_selector;

    this.registerAteji = function(){
      var names = [];
      this_tag.namesSelector.forEach((name)=>{

        console.log("name");
        console.log(name);
        console.log(name.atejiSelector);
        names.push({
          original:name.original_name,
          atejis:name.atejiSelector.getSubmitKanjis()
        });
      });

      this_tag.refs["names_input"].value = JSON.stringify(names);

      this_tag.refs["gonext_form"].submit();
    }.bind(this)
});