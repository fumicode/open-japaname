var express = require('express');
var user_router = module.exports = express.Router();

var co = require('co');
var _ = require("underscore");
var router_helper = require("../util/router_helper");

var mongoose = require('mongoose');
var User = mongoose.model("User");
var Japaname = mongoose.model("Japaname");


user_router.get('/', function(req, res, next) {
  co(function*(){
    var the_user = req.the_user; //fetched in upper directory

    res.render("admin/user",{
      the_user
    });

  }).catch(function(err){
    next(err);
  });

});


user_router.put('/',function(req,res,next){
  co(function*(){
    req.checkBody({
      /*
      'username': {
        notEmpty: true,
        isEmail: {
          errorMessage: 'Invalid Email'
        }
      },
      'password': {
        notEmpty: true,
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
      res.redirect("admin/users");
      return;
    }

    if(req.body.username){
      req.the_user.username = req.body.username
    }

    if(req.body.authorities){
      req.the_user.authorities = router_helper.stringToArray(req.body.authorities,",");

    }

    if(req.body.my_japaname){
      var my_japaname = req.body.my_japaname;


      if(Japaname.isJapanameCode(my_japaname)){
        var japaname_number = Japaname.japanameDecode(my_japaname);

        req.the_user.my_japaname = japaname_number;
      }

    }

    if(req.body.password){
      req.the_user.setPassword(req.body.password);
    }

    var saved_user = yield req.the_user.save();

    req.flash("info","ユーザーの情報を編集しました.");
    res.redirect("./" + saved_user._id);
  }).catch(err=>next(err));
});

user_router.get('/delete',function(req,res,next){
  res.render("admin/user_delete",{the_user:req.the_user});
});

user_router.delete('/',function(req,res,next){
  co(function*(){
    var result = yield User.findById(req.the_user._id).remove().exec();

    console.log(result);
    req.flash("info", "user "+req.the_user.username+" has deleted");
    res.redirect("/admin/users");
  })
  .catch(err=>next(err));



});


function trim(str){
  return str.replace(/(^\s+)|(\s+$)/g, "");
}


