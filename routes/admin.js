var express = require('express');
var admin_router = module.exports = express.Router();

var mongoose = require("mongoose");
var ShodoRequest = mongoose.model("ShodoRequest");
var User = mongoose.model("User");

var requests_router = require("./requests");
var users_router = require("./users");
var co = require("co");


admin_router.get('/', function(req, res, next) {
  co(function*(){

    var users = yield User.find()
      .limit(5)
      .populate("my_japaname")
      .exec();

    console.log("users");
    console.log(users);
    res.render("admin", {
      users
    });
    return ;

  })
  .catch(function(err){
    next(err);
  });
});

admin_router.use("/users",users_router);

