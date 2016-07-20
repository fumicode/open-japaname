var authModule = module.exports = {};


var _ = require("underscore");

authModule.loginCheck = function(req,res,next){
  if(!req.isAuthenticated()){
    req.flash("alert", "You have to log in.");
    res.redirect("/auth/login");
    return;
  }
  next();
};


authModule.authorize = function(right){
  var rights = [].concat(right); //OR. rightsのうちどれかの権限があれば、OK

  return function(req,res,next){
    if(req.isAuthenticated()){
      for(var i = 0; i < rights.length; i ++){
        var right = rights[i];
        if(req.user.haveRight(right)){
          return next();
        }
      }
      return next(new Error("Authentication failed"));
    }
    else{
      return next(new Error("Authentication failed"));
    }
  };
};


authModule.loadUser = function(req,res,next){
  res.locals.user = req.user;

  if(req.user){
    req.user.populate({
      path:"my_japaname",
      populate:{
        path:"names.ateji"
      }
    })
    .execPopulate()
    .then(function(){


      return next();
    })
    .catch((err)=>{
      next(err);
    });
  }
  else{
    return next();
  }

};



