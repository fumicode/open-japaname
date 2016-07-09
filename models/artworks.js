module.exports = artworks = {};

var artwork_list = {
  "risumaru_ofuda":{ 
    "artwork_name" :"risumaru_ofuda",
    "ratio" : 1.8,
    "jp_name":"レシートお札"

  },

  "risumaru_ume":{ 
    "artwork_name" :"risumaru_ume",
    "ratio" : 1.42,
    "jp_name":"梅"

  },

  "risumaru_take":{ 
    "artwork_name" :"risumaru_take",
    "ratio" : 1.42,
    "jp_name":"竹"

  },

  "risumaru_matsu":{ 
    "artwork_name" :"risumaru_matsu",
    "ratio" : 1.42,
    "jp_name":"松"
  },
}

artworks.doesExist = function(artwork_name){
  return artwork_list[artwork_name];
}

artworks.getList = function(){
  return artwork_list;
}

artworks.get = function(artwork_name){
  var artwork =  artwork_list[artwork_name];

  if(!artwork){
    throw new Error("artwork "+artwork+" is not found");
  }

  return artwork;
}
