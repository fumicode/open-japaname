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

          if(fieldName == "japaname_string"){
            //var length = element.textLength();
          }
        }
      });


      var image_element = svg.paper.select("#qrcode");
      if(image_element){
        image_element.attr("xlink:href", variables.qrcode_url);
      }

      svg.prependTo(container);
      
    });
  
})($("#artwork_svg")[0]);

