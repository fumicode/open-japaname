var express = require('express');
var user_router = module.exports = express.Router();

var co = require('co');
var _ = require("underscore");
var router_helper = require("../util/router_helper");

var mongoose = require('mongoose');
var User = mongoose.model("User");


user_router.get('/', function(req, res, next) {
  co(function*(){

    var the_user = req.the_user; //fetched in upper directory
    var requests = yield ShodoRequest.find({user:the_user._id})
      .populate("purchase_ateji")
      .populate("user")
      .exec();

    res.render("admin/user",{
      the_user,
      requests
    });

  }).catch(function(err){
    next(err);
  });
});


user_router.put('/',function(req,res,next){
  console.log("ok");

  req.checkBody({
    /*
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      }
    },
    'password': {
      optional: true, // won't validate if field is empty
      isLength: {
        options: [6, 20] // pass options to the validator with the options property as an array
      },
      errorMessage:  'Invalid Password. Password should not be empty'+
        ' and the length should be 6-20.'// Error message for the parameter
    },
    */
  });

  var errors = req.validationErrors();

  console.log(5);
  if (errors && errors.length > 0) {
    console.log("errors");
    console.log(errors);

    req.flash("info", "some format error" +JSON.stringify( errors));
    res.render("admin/user");
    return;
  }

  co(function*(){
    if(req.body.email){
      req.the_user.userinfo.email = req.body.email;
    }


    console.log("req.body.authorities");
    console.log(req.body.authorities);
    if(req.body.authorities){
      req.the_user.authorities = router_helper.stringToArray(req.body.authorities,",");
      console.log( req.the_user.authorities );

    }

    if(req.body.ateji_id){
      req.the_user.ateji_id = req.body.ateji_id;
    }

    if(req.body.password){
      req.the_user.setPassword(req.body.password);
    }

    var saved_user = yield req.the_user.save();

    req.flash("info","ユーザーの情報を編集しました.");
    res.redirect("./" + saved_user._id);

  }).catch((err)=>{
    next(err);
  });


});

user_router.get('/delete',function(req,res,next){
  res.render("admin/user_delete",{the_user:req.the_user});
});

user_router.delete('/',function(req,res,next){
  User.findById(req.the_user._id).remove().exec()
  .then((something)=>{
    console.log("something");
    console.log(something);

    req.flash("info", "user has deleted");
    res.redirect("/admin/users");
  });

});


function trim(str){
  return str.replace(/(^\s+)|(\s+$)/g, "");
}


