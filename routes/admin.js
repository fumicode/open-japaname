var express = require('express');
var co = require("co");

var admin_router = module.exports = express.Router();

var mongoose = require("mongoose");
var User = mongoose.model("User");
var Purchase = mongoose.model("Purchase");
var Japaname = mongoose.model("Japaname");

var users_router = require("./users");


admin_router.get('/', function(req, res, next) {
  co(function*(){
    var users = yield User.find()
      .limit(5)
      .populate("my_japaname")
      .exec();

    var purchases = yield Purchase.find()
      .limit(10)
      .populate("buyer")
      .exec();

    console.log("users");
    console.log(users);

    var japanames = yield Japaname.getLatestNames(50);

    res.render("admin", {
      users,
      purchases,
      japanames
    });
    return ;

  })
  .catch(function(err){
    next(err);
  });
});

admin_router.use("/users",users_router);

