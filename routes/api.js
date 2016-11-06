
var express = require('express');
var _router = module.exports = express.Router();


//mongoose
//
var _ = require("underscore");

var co = require("co");



_router.get("/",(req,res,next)=>{


  var obj = {
    "hoge":"fuga"
  };

  res.render("contents/test", {data:obj});
});


