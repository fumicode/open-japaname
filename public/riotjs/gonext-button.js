
riot.tag2('gonext-button', '<form id="gonext-form" ref="gonext_form" method="POST" action="/names"> <input type="hidden" ref="original_name_input" name="original_name" riot-value="#{original_name}"> <input type="hidden" ref="ateji_json_input" name="ateji_json" value=""> </form> <button class="goNextButton {opts.center ? \'goNextButton--center\' :\'\'}" onclick="{registerAteji}">&raquo;Go<br>Next!</button>', '', '', function(opts) {
    var this_tag = this;
    this.atejiSelector  = opts.ateji_selector;

    this.registerAteji = function(){
      var submitKanjis = this_tag.atejiSelector.getSubmitKanjis();

      this_tag.refs["original_name_input"].value = this.atejiSelector.getOriginalName();
      this_tag.refs["ateji_json_input"].value = JSON.stringify(submitKanjis);

      this_tag.refs["gonext_form"] .submit();
    }.bind(this)
});