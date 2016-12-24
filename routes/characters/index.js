var express = require('express');
var characters_router = module.exports = express.Router();


//mongoose
//
var _ = require("underscore");

var co = require("co");

var kanjis_router = require("./kanjis");
var hiraganas_router = require("./hiraganas");
var words_router = require("../words");


characters_router.get("/",(req,res,next)=>{
  return res.render('contents/3_kind_of_characters');
});

characters_router.use('/hiraganas',hiraganas_router);
characters_router.use('/kanjis',kanjis_router);
characters_router.use('/words',words_router);
