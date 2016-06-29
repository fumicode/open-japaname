var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});




/* ateji short url */
router.get('/:japaname_id([0-9\-]+)', function(req, res, next) {
  var japaname_id = req.params.japaname_id;
  req.url =  "/names/" + japaname_id;
  return next();
});

module.exports = router;
