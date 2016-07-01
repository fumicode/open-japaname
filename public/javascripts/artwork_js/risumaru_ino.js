(function(container){
  Snap.ajax("/images/design_templates/risumaru_ino.svg",// {key: "value"}, //省略可
    function(request){
      var svg = Snap(request.responseXML.documentElement)
        .attr({width:"100%", height:"100%"});
      console.log(svg);

      Object.keys(variables).forEach(function(fieldName){
        var fieldValue = variables[fieldName];
        var element = svg.paper.select("#"+ fieldName);
        element.attr("text", fieldValue);
      });

      svg.prependTo(container);
    });
  
})($("#artwork_svg")[0]);

