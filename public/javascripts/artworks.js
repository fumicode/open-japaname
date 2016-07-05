//var artwork_name = "risumaru_ino";

(function(container){

  Snap.ajax("/images/artworks/"+artwork_name+".svg",// {key: "value"}, //省略可
    function(request){
      var svg = Snap(request.responseXML.documentElement)
        .attr({width:"100%", height:"100%"});
      console.log(svg);

      Object.keys(variables).forEach(function(fieldName){
        var fieldValue = variables[fieldName];
        var element = svg.paper.select("#"+ fieldName);
        if(element)
          element.attr("text", fieldValue);
      });

      svg.prependTo(container);
    });
  
})($("#artwork_svg")[0]);

