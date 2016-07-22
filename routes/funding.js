var express = require('express');
var funding_router = module.exports = express.Router();

//mongoose
//
var _ = require("underscore");
var co = require("co");

funding_router.get("/",(req,res,next)=>{
  res.render("funding.ejs");
});


