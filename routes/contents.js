var express = require('express');
var atejilib = require("../core/atejilib.js");
var router = express.Router();

var _ = require("underscore");

var page_list = ["asct", "prices", "purchase-flow-en", "purchase-flow", "example-of-catherine", "makuake"];



router.get('/', function(req, res, next) {
  res.render("contents", {page_list:page_list});
});

router.get('/test', function(req, res, next) {
  var data = {
    a:"b",
    c:"d",
  };

  console.log("hello test");

  res.render("contents/test", {data:data});
});


/* GET users listing. */

_.each(page_list,function(page_name){
  router.get('/' + page_name, function(req, res, next) {
    res.render("contents/"+page_name);
  });
});


module.exports = router;
