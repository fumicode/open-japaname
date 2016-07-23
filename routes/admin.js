var express = require('express');
var co = require("co");

var admin_router = module.exports = express.Router();

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Purchase = mongoose.model("Purchase");

var users_router = require("./users");


admin_router.get('/', function(req, res, next) {
  co(function*(){

    var users = yield User.find()
      .limit(5)
      .populate("my_japaname")
      .exec();

    var purchases = yield Purchase.find().exec();

    console.log("users");
    console.log(users);
    res.render("admin", {
      users,
      purchases
    });
    return ;

  })
  .catch(function(err){
    next(err);
  });
});

admin_router.use("/users",users_router);

