var express = require('express');
var users_router = module.exports = express.Router();

var user_router = require("./user");

var co = require('co');

var mongoose = require('mongoose');
var User = mongoose.model("User");

/* GET users listing. */
users_router.get('/', function(req, res, next) {

  co(function*(){
    var users = yield User.find().populate("ateji_id").exec();
    res.render("admin/users",{
      users
    });
  })
  .catch(function(err){
    res.respondError("",err);
  });
});


users_router.param("user_id",function(req,res,next,user_id){
  co(function*(){
    var user = yield User.findById(user_id).exec();
    if(user){
      req.the_user = user;
      return next();
    }
    else{
      return res.respond404("user was not found");
    }
  })
  .catch((err)=>{
    res.respond404("user was not found");
  });
});

users_router.use('/:user_id',user_router);
