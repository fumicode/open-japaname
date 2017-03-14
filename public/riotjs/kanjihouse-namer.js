
riot.tag2('kanjihouse-namer', '<form action="#{action_url}" method="post"> <table class="kanjihouseNamer"> <tr> <th class="kanjihouseNamer__headCell">オリジナル</th> <td> <input type="text" name="original_name" ref="original_name" riot-value="{name.original}" onchange="{changeOriginal}" style="display:inline"> <input type="button" onclick="{estimateKana}" value="読みを推測"> </td> </tr> <tr> <th class="kanjihouseNamer__headCell">カナ</th> <td> <input type="text" name="name_kana" ref="name_kana" style="display:inline" onchange="{kanaChanged}"> <input type="button" onclick="{kanaChangedForce}" value="下に挿入"> </td> </tr> <tr> <td colspan="2"> <h5>当て字</h5> <table class="kanjihouseNamer__table"> <tr> <th>カナ</th> <th>漢字</th> <th>意味</th> <th>コメント</th> <th>削除ボタン</th> </tr> <tr data-is="kanjihouse-ateji-row" atemoji="{atemoji}" index="{index}" each="{atemoji,index in name.atejis}" ondelete="{parent.deleteRow}" onchange="{parent.changeAtemoji}"></tr> </table><a class="button" onclick="{addRow}">文字を追加</a> </td> </tr> <tr> <td colspan="2"> <input type="hidden" name="names" riot-value="{names_str}"> <input type="button" onclick="submit()" value="Japanameをつくる"> </td> </tr> </table> </form>', '', '', function(opts) {
    var this_tag = this;

    function Atemoji(kana,kanji,meanings,comment){
      this.kana = kana;
      this.kanji = kanji;
      this.meanings = meanings;
      this.comment = comment;
    }

    Atemoji.prototype.isEmpty =function(){
      return !this.kana && !this.kanji;
    }

    this.name = {
      original:"",
      atejis:[
        new Atemoji("", "", [""], ""),
        new Atemoji("", "", [""], ""),
        new Atemoji("", "", [""], ""),
      ],

      isEmpty:function(){
        var allEmpty = _(this.atejis).reduce(function(empty, ateji){
          return empty && ateji.isEmpty()
        },true);

        return allEmpty
      }
    };

    this.names_str = JSON.stringify([ this.name ]);

    this.on("update",function(){
      this.names_str = JSON.stringify([ this.name ]);
    });

    this.changeOriginal = function(e){
      var original_name = e.target.value;

      this.name.original = original_name;

    }.bind(this)

    this.changeAtemoji = function(e){
      var atemoji = e.item.atemoji;
      var index = e.item.index;
      this.name.atejis[index][e.target.name] = e.target.value;
    }.bind(this)

    this.estimateKana = function(e){

      var original_name_input = this_tag.refs.original_name;
      var original_name = original_name_input.value;

      request
        .get("/api/core/names/kana_translation/" + original_name )
        .end(function(err, res){

          var res_json = JSON.parse(res.text);
          console.log(res_json);

          this_tag.refs.name_kana.value = res_json.katakana;

          this_tag.kanaChanged(e);
          this_tag.update();
        });

    }.bind(this)

    this.kanaChanged = function(e){
      var kana_string = this.refs.name_kana.value;

      if(!this.name.isEmpty()){
        return ;
      }

      var new_atejis= [];
      _(kana_string).each(function(kana){
        new_atejis.push(new Atemoji(kana, "", [""], ""));
      });

      this.name.atejis = new_atejis;
    }.bind(this)

    this.kanaChangedForce = function(e){
      var kana_string = this.refs.name_kana.value;

      console.log(kana_string);

      var new_atejis = _(kana_string).map(function(kana){
        return new Atemoji(kana, "", [""], "");
      });

      this.name.atejis = new_atejis;
    }.bind(this)

    this.addRow = function(e){
      this.name.atejis.push(new Atemoji("","",[""],""))
    }.bind(this)

    this.deleteRow = function(e){
        console.log("deleting");

      console.log(e.item)
      this.name.atejis.splice(e.item.index, 1);
      this.update();
    }.bind(this)

});
riot.tag2('kanjihouse-ateji-row', '<td> <input class="kanjihouseNamer__kanaBox" name="kana" type="text" riot-value="{atemoji.kana}" onchange="{changeAtemoji}"> </td> <td> <input class="kanjihouseNamer__kanjiBox" name="kanji" type="text" riot-value="{atemoji.kanji}" onchange="{changeAtemoji}"> </td> <td> <textarea class="kanjihouseNamer__meaningsBox" name="meanings" onchange="{changeAtemoji}">{atemoji.meanings}</textarea> </td> <td> <textarea class="kanjihouseNamer__commentBox" name="comment" onchange="{changeAtemoji}">{atemoji.changeAtemoji}</textarea> </td> <td><a class="button" onclick="{ondeleteFunc}">削除</a></td>', '', '', function(opts) {
    this.atemoji = opts.atemoji;
    this.index = opts.index;
    this.ondelete = opts.ondelete;
    this.onchange = opts.onchange;

    this.ondeleteFunc = function(e){
      if(this.ondelete && typeof this.ondelete === "function"){
        this.ondelete(e);
      }
    }.bind(this)

    this.changeAtemoji = function(e){
      if(this.onchange&& typeof this.onchange === "function"){
        this.onchange(e);
      }
    }.bind(this)
});