//end of body, after loading library

$(function(){
  $(".kana-radiobox").change(function(e){

    var $that = $(this);

    var name = $that.prop('name');

    $that.trigger("change2", {checked:true}); //true

    var otherColumn = $(".kana-radiobox[name=" + name + "]").not($that);
    otherColumn.trigger("change2", {checked:false}); //true

  });


  $(".kana-radiobox").bind("change2", function(e, param){
    var checked = param.checked;

    $that = $(this);
    $that.prop("checked",checked);

    if(checked) { //i am checked

      // yoko
      var siblings = $that.siblings(".kana-radiobox").not(":checked");
      siblings.trigger("change2", {checked:true});

      // tate
      var otherColumn = $(".kana-radiobox[name=" + $that.prop("name") + "]").not($that).not(":checked");
      otherColumn.trigger("change2", {checked:false}); //true

    }
    else{ //i am not checked

      //yoko
      $that.siblings(".kana-radiobox:checked").trigger("change2", {checked:false});
    }
  });

  $(".ateji-cand-radio").click(function(e){
    $that = $(this);
    $kana_cell = $that.parents(".kana-cell");

    $kana_cell.children(".kana-radiobox"). trigger("change");

    updateSelectedName();
    updateFilled();

  });

});


function updateSelectedName(){
  var namearray = [];
  $(".kana-radiobox:checked:first-child").siblings(".kana-box").find(".ateji-cand-radio:checked")
  .map(function(index, el){

    var kana = el.name.split("_")[2].substr(1);

    namearray.push({syl_index: el.id.split("_")[2].charAt(1), kanji:el.value, kana:kana});
  });

  namearray.sort(function(right,left){
    if(right.syl_index < left.syl_index){
      return -1;
    }
    else if(right.syl_index > left.syl_index){
      return 1;
    }

    return 0;
  });

  var str = "";
  var url = "";
  for(var i =0;i<namearray.length;i++){
    str += namearray[i].kanji;
    url += (i === 0 ? "" : "_" ) + namearray[i].kana + "-"+ namearray[i].kanji;
  }

  console.log("name is " + str);
  console.log(namearray);

  $("#kanji-selected span").text(str);
  $("#selected_ateji").val(JSON.stringify(namearray));
  // .siblings(".kana-box")
  // .children(".ateji-cand-radio:checked")
   
}

function updateFilled(){
  var namesound = "";
  $(".hiragana-char").map(function(index,el){
    $that = $(el);
    var $checked = $(".kana-radiobox[name="+el.id+"]:checked");

    if($checked.length > 0){
      $that.removeClass("notselected");
      namesound += $that.text(); 
    }
    else{
      $that.addClass("notselected");
    }

  });

  $("#japanese-sound").text(namesound);
  

}

updateSelectedName();

updateFilled();

