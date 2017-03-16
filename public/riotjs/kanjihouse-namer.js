
riot.tag2('kanjihouse-namer', '<form ref="kanjihouse_namer_form" action="#{action_url}" method="post"> <table class="kanjihouseNamer"> <tr> <th class="kanjihouseNamer__headCell">オリジナル</th> <td> <input type="text" name="original_name" ref="original_name" riot-value="{name.original}" onchange="{changeOriginal}" style="display:inline"> <input type="button" onclick="{estimateKana}" value="読みを推測"> </td> </tr> <tr> <th class="kanjihouseNamer__headCell">カナ</th> <td> <input type="text" name="name_kana" ref="name_kana" style="display:inline" onchange="{kanaChanged}"> <input type="button" onclick="{kanaChangedForce}" value="下に挿入">データベースには保存されません。空欄でも可。 </td> </tr> <tr> <td colspan="2"> <h5>当て字</h5> <table class="kanjihouseNamer__table"> <tr> <th>カナ</th> <th>漢字</th> <th>意味 <p style="font-weight:normal;font-size:small">辞書にある場合は補完されます。</p> </th> <th>コメント</th> <th>削除ボタン</th> </tr> <tr data-is="kanjihouse-ateji-row" atemoji="{atemoji}" index="{index}" each="{atemoji,index in name.atejis}" ondelete="{parent.deleteRow}" onchange="{parent.changeAtemoji}"></tr> </table><a class="button" onclick="{addRow}">文字を追加</a> </td> </tr> <tr> <td colspan="2"> <input type="hidden" name="names" riot-value="{names_str}"> <input type="button" onclick="{submit}" value="Japanameを保存"> </td> </tr> </table> </form>', '', '', function(opts) {
    var this_tag = this;
    this.japaname = opts.japaname || null;

    function Atemoji(kana, kanji, meanings, comment){
      this.kana = kana;
      this.kanji = kanji;
      this.meanings = meanings;
      this.comment = comment;
    }

    Atemoji.prototype.isEmpty =function(){
      return !this.kana && !this.kanji;
    }

    function Name(original, kana, atejis){
      this.original = original;
      this.kana = kana;
      this.atejis = atejis;
    }

    Name.prototype.isEmpty = function(){
      var allEmpty = _(this.atejis).reduce(function(empty, ateji){
        return empty && ateji.isEmpty()
      },true);

      return allEmpty
    }

    this_tag.beforeunload = function(e){
      var message = "このページを離れてもよろしいですか？";
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", this_tag.beforeunload);

    if(this.japaname){
      let name = this.japaname.names[0];

      let atemojis = _(name.ateji.atemojis).map( atemoji =>{
        return new Atemoji(atemoji.kana, atemoji.kanji, [""], atemoji.comment)
      });

      let kana = _(name.atemojis).reduce((str, atemoji)=>{
        return str + atemoji.kana
      },"");

      this.name = new Name(name.original, "",atemojis);
    }
    else{
      this.name = new Name("","", [
        new Atemoji("", "", [""], ""),
        new Atemoji("", "", [""], ""),
        new Atemoji("", "", [""], ""),
      ]);
    }

    this.names_str = JSON.stringify([ this.name ]);

    this.on("update",function(){
      this_tag.names_str = JSON.stringify([ this.name ]);
    });

    this.changeOriginal = function(e){
      var original_name = e.target.value;

      this_tag.name.original = original_name;

    }.bind(this)

    this.changeAtemoji = function(e){
      var atemoji = e.item.atemoji;
      var index = e.item.index;

      if(e.target.name == "meanings"){
        this_tag.name.atejis[index][e.target.name]
          = e.target.value.split("\n");
      }
      else{
        this_tag.name.atejis[index][e.target.name]
          = e.target.value;
      }

      this_tag.update();
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

      this_tag.name.atejis = new_atejis;
    }.bind(this)

    this.kanaChangedForce = function(e){
      var kana_string = this.refs.name_kana.value;

      console.log(kana_string);

      var new_atejis = _(kana_string).map(function(kana){
        return new Atemoji(kana, "", [""], "");
      });

      this_tag.name.atejis = new_atejis;
    }.bind(this)

    this.addRow = function(e){
      this_tag.name.atejis.push(new Atemoji("","",[""],""))
    }.bind(this)

    this.deleteRow = function(e){
      console.log("deleting");
      console.log(e.item)
      this_tag.name.atejis.splice(e.item.index, 1);
      this_tag.update();
    }.bind(this)

    this.submit = function(e){
      window.removeEventListener("beforeunload", this_tag.beforeunload);
      this.refs.kanjihouse_namer_form.submit();
    }.bind(this)

});
riot.tag2('kanjihouse-ateji-row', '<td> <input class="kanjihouseNamer__kanaBox" name="kana" type="text" riot-value="{atemoji.kana}" onchange="{changeAtemoji}"> </td> <td> <input class="kanjihouseNamer__kanjiBox" name="kanji" type="text" riot-value="{atemoji.kanji}" onchange="{changeKanji}"> </td> <td> <textarea class="kanjihouseNamer__meaningsBox" name="meanings" onchange="{changeAtemoji}">{atemoji.meanings.join(\'\\n\')}</textarea> </td> <td> <textarea class="kanjihouseNamer__commentBox" name="comment" onchange="{changeAtemoji}">{atemoji.comment}</textarea> </td> <td><a class="button" onclick="{ondeleteFunc}">削除</a></td>', '', '', function(opts) {
    var this_tag = this;
    this.atemoji = opts.atemoji;
    this.index = opts.index;
    this.ondelete = opts.ondelete;
    this.onchange = opts.onchange;

    this.on("mount",function(){
      console.log("mount");
      console.log(this.atemoji);

      var meanings = this.atemoji.meanings;
      if(this.atemoji.kanji && (!meanings || meanings.length==0 || meanings[0] == "")){

        fetchKanjiMeanings(this_tag.atemoji.kanji).then((meanings)=>{
          console.log("meaning wakatta");
          console.log(this_tag);

          this_tag.atemoji.meanings = meanings;
          this_tag.update();
        });
      }

    });

    this.ondeleteFunc = function(e){
      if(this.ondelete && typeof this.ondelete === "function"){

        this.ondelete(e);
      }
    }.bind(this)

    this.changeKanji = function(e){
      var kanji = e.target.value;

      fetchKanjiMeanings(kanji).then((meanings)=>{
        this_tag.atemoji.meanings = meanings;
        this_tag.update();
        return ;
      }).then(()=>{
        this_tag.changeAtemoji(e);
      }).catch((err)=>{
        console.error(err);
      });

    }.bind(this)

    function fetchKanjiMeanings(kanji){
      return new Promise((resolve,reject)=>{
        if(!kanji){
          return reject(new Error( kanji + " is empty"));
        }

        request
          .get("/api/core/kanjis/" + kanji)
          .end(function(err, res){
            if(err){
              reject(err);
            }
            var kanji = JSON.parse(res.text);

            if(!kanji.kanji){
              return resolve([]);
            }

            var meanings = kanji.meanings;
            if(!meanings || meanings.length == 0){
              return resolve([]);
            }

            return resolve(meanings);
          });
      });
    }

    this.changeAtemoji = function(e){
      if(this.onchange&& typeof this.onchange === "function"){
        this.onchange(e);
      }
    }.bind(this)
});