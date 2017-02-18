
riot.tag2('kanjihouse-namer', '<form action="#{action_url}" method="post"> <table class="kanjihouseNamer"> <tr> <th class="kanjihouseNamer__headCell">オリジナル</th> <td> <input type="text" name="original_name" riot-value="{name.original}" onchange="{changeOriginal}"> </td> </tr> <tr> <th class="kanjihouseNamer__headCell">カナ</th> <td> <input type="text" name="kana"> </td> </tr> <tr> <td colspan="2"> <h5>当て字</h5> <table class="kanjihouseNamer__table"> <tr> <th>カナ</th> <th>漢字</th> <th>意味</th> <th>コメント</th> <th>削除ボタン</th> </tr> <tr each="{atemoji,index in name.atejis}"> <td> <input class="kanjihouseNamer__kanaBox" name="kana" type="text" riot-value="{atemoji.kana}" onchange="{changeAtemoji}"> </td> <td> <input class="kanjihouseNamer__kanjiBox" name="kanji" type="text" riot-value="{atemoji.kanji}" onchange="{changeAtemoji}"> </td> <td> <textarea class="kanjihouseNamer__meaningsBox" name="meanings" onchange="{changeAtemoji}">{atemoji.meanings}</textarea> </td> <td> <textarea class="kanjihouseNamer__commentBox" name="comment" onchange="{changeAtemoji}">{atemoji.changeAtemoji}</textarea> </td> <td><a class="button" onclick="{deleteRow}">削除</a></td> </tr> </table><a class="button" onclick="{addRow}">文字を追加</a> </td> </tr> <tr> <td colspan="2"> <input type="hidden" name="names" riot-value="{names_str}"> <input type="submit" value="Japanameをつくる"> </td> </tr> </table> </form>', '', '', function(opts) {
    function Atemoji(kana,kanji,meanings,comment){
      this.kana = kana;
      this.kanji = kanji;
      this.meanings = meanings;
      this.comment = comment;
    }

    this.name = {
      original:"",
      atejis:[
        new Atemoji("", "", [""], ""),
        new Atemoji("", "", [""], ""),
        new Atemoji("", "", [""], ""),
      ]
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

    this.addRow = function(e){
      this.name.atejis.push(new Atemoji("","",[""],""))
    }.bind(this)

    this.deleteRow = function(e){
      this.name.atejis.splice(e.item.index, 1);
    }.bind(this)
});