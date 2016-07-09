//var artwork_name = "risumaru_ino";

(function(container){

  Snap.ajax("/images/artworks/"+artwork_name+".svg",// {key: "value"}, //省略可
    function(request){
      var svg = Snap(request.responseXML.documentElement)
        .attr({width:"100%", height:"100%"});




      Object.keys(variables).forEach(function(fieldName){
        var fieldValue = variables[fieldName];
        var element = svg.paper.select("#"+ fieldName);

        if(element){
          element.attr("text", fieldValue);

        }

        if(fieldName == "japaname_string"){

          var japaname_string = fieldValue;


          var japaname_box = svg.paper.select("#japaname_box");


          var x = parseInt(japaname_box.attr("x"));
          var y = parseInt(japaname_box.attr("y"));
          var box_height= parseInt(japaname_box.attr("height"));


          if(!japaname_box){
            alert("japaname_box not defined")
            return;
          }

          var box_height = 125;
          var char_num =  japaname_string.length;

          var char_height = box_height/ char_num;


          for(index  in  japaname_string){
            var chara = japaname_string[index];

            var text = japaname_box.text(x, y + char_height/2 + (index ) * char_height, chara);

            text.attr({style:'font-family:"ro-nikkatsu-sei-kai-std";font-size:'+char_height+'px;glyph-orientation-vertical:0;writing-mode:tb;fill:#FFFFFF', "text-anchor":"middle"})

            
          }



        }
      });


      {
        var image_element = svg.paper.select("#qrcode");
        if(image_element){
          image_element.attr("xlink:href", variables.qrcode_url);
        }
      }

      svg.prependTo(container);
      
    });
  
})($("#artwork_svg")[0]);

