// config/passport.js

var co = require("co");

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
//var TwitterStrategy = require('passport-twitter').Strategy;

// load up the user model
var mongoose = require("mongoose");
var User = mongoose.model("User");


var configAuth = require('./auth_config.js');
// expose this function to our app using module.exports
module.exports = function(passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session


  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback:true
  },function(req, username, password, done){
    co(function*(){
      if(password !== req.body.confirm_password){
        return done(null, null, {message:"Passwords is not same"});
      }

      //retype password
      User.register(new User({
        username: req.body.username,
        //japaname: Japaname.japanameDecode(japaname_code) atode
      }), password, function (err, user) {
        try{
          if(err){
            return done(null, null, {message:err.message});
          }

          if(user){
            return done(null, user); //success!!!!!
          }
          else{
            throw new Error("error and user is null");
          }
        }catch(err){
          return done(err, null); //success!!!!!
        }
      
      });
    }).catch((err)=>{
      return done(err, null)
    });
  }));

  // delegate loginStrategy to User (passport-local-mongoose)
  passport.use('local-login', new LocalStrategy(User.authenticate()));

  // used to serialize the user for the session
  passport.serializeUser(User.serializeUser());

  // used to deserialize the user
  passport.deserializeUser(User.deserializeUser());

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({
    // pull in our app id and secret from our auth.js file
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'name', 'email']
  },
  // facebook will send back the token and profile
  function(token, refreshToken, profile, done) {

console.log("-------------func-------------");
console.log("token" + token);
console.log("refreshToken" +  refreshToken);
console.log("profile " + JSON.stringify(profile));
console.log("done" + done);

    // asynchronous
    process.nextTick(function() {
      

console.log("tick");

      // find the user in the database based on their facebook id
      User.findOne({ 'userinfo.facebook.id' : profile.id }, function(err, user) {

console.log("findone");
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err)
          return done(err);

        // if the user is found, then log them in
        if (user) {

console.log("user found");
          return done(null, user); // user found, return that user
        } else {

console.log("user register");
          // if there is no user found with that facebook id, create them
          var newUser            = new User();
          

          console.log("facebook info");
          console.log(profile.id);
          console.log(token);
          console.log(profile.name.givenName);
          console.log(JSON.stringify(profile));
          // set all of the facebook information in our user model
          newUser.userinfo.facebook.id    = profile.id; // set the users facebook id
          newUser.userinfo.facebook.token = token; // we will save the token that facebook provides to the user
          newUser.userinfo.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.userinfo.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

          // save our user to the database
          newUser.save(function(err) {
            if (err)
            throw err;

          // if successful, return the new user
          return done(null, newUser);
          });
        }

      });
    });

  }));


  /*

  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  passport.use(new TwitterStrategy({

    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL

  },
  function(token, tokenSecret, profile, done) {

    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Twitter
    process.nextTick(function() {

      User.findOne({ 'userinfo.twitter.id' : profile.id }, function(err, user) {

        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err)
        return done(err);

      // if the user is found then log them in
      if (user) {
        return done(null, user); // user found, return that user
      } else {
        // if there is no user, create them
        var newUser                 = new User();

        // set all of the user data that we need
        newUser.userinfo.twitter.id          = profile.id;
        newUser.userinfo.twitter.token       = token;
        newUser.userinfo.twitter.name        = profile.displayName;
        newUser.userinfo.twitter.email       = profile.username;
        console.log('twitter', newUser);

        // save our user into the database
        newUser.save(function(err) {
          if (err)
          throw err;
        return done(null, newUser);
        });
      }
      });

    });

  }));
  */
};

