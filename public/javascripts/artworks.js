//var artwork_name = "risumaru_ino";

function drawSvg(container, artwork_name, japaname_code){
  Snap.ajax("/artworks/"+artwork_name+"/"+japaname_code+"/thumbnail",// {key: "value"}, //省略可
    function(request){
      var svg = Snap(request.responseXML.documentElement)
        .attr({width:"100%", height:"100%"});
      svg.prependTo(container);
    }
  );
}

