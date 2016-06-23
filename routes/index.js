var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});




/* ateji short url */
router.get('/:ateji_id([0-9]+)', function(req, res, next) {

  var ateji_id = req.params.ateji_id;
  if(/\d+/.test(ateji_id)){
    req.url =  "/atejis/saved/" + ateji_id;
  }
  else{
  }

  next();
  
});

module.exports = router;
