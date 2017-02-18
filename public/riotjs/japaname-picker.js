
riot.tag2('japaname-picker', '<div class="japanamePicker"> <input type="hidden" name="japanames" riot-value="{japaname_ids_json}"> <div class="japanamePicker__picked"> <h3>このメールに添付</h3> <table style="width:100%"> <tr each="{japaname,index in picked_japanames}"> <td>{japaname.code}</td> <td>{japaname.original}</td> <td>{japaname.string}</td> <td><a class="button" onclick="{parent.deleteFromPicked}">削除</a></td> </tr> </table> </div> <div class="japanamePicker__candidate"> <h3>最近作った</h3> <table style="width:100%"> <tr each="{japaname,index in candidate_japanames}"> <td>{japaname.code}</td> <td>{japaname.original}</td> <td>{japaname.string}</td> <td><a class="button" onclick="{parent.addToPicked}">追加</a></td> </tr> </table> </div> </div>', '', '', function(opts) {
    this.candidate_japanames = opts.candidate_japanames || [];
    this.picked_japanames = opts.picked_japanames || [];

    console.log(this.candidate_japanames)
    console.log(this.candidate_japanames)

    this.japaname_ids_json =
        JSON.stringify( _(this.picked_japanames).map(jn=>jn._id || jn) );

    this.on("update",function(){

      this.japaname_ids_json =
          JSON.stringify( _(this.picked_japanames).map(jn=>jn._id || jn) );
    });

    this.addToPicked = function(e){

      var japaname = e.item.japaname;

      if(this.picked_japanames.indexOf(japaname) != -1){

        console.log("already exist");
        return;
      }

      this.picked_japanames.push(japaname);
    }.bind(this)

    this.deleteFromPicked = function(e){
      e.preventDefault();

      console.log("delete");
      var deleting_index = e.item.index;
      this.picked_japanames.splice(deleting_index,1);
    }.bind(this)
});