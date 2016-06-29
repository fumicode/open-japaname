// config/passport.js

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

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },

  function(req, email, password, done) {
    console.log("local-signup");
    // asynchronous
    // User.findOne wont fire unless data is sent back

    var ateji_id = req.body.ateji_id;
    var use_ateji_id = req.body.use_ateji_id; //Boolean

    /////////////////////////////Verification///////////////////////////////
    req.checkBody({
      'email': {
        notEmpty: true,
        isEmail: {
          errorMessage: 'Invalid Email. Please check the format.'
        }
      },
      'password': {
        notEmpty: true,

        isLength: {
          options: [6, 20] // pass options to the valdatior with the options property as an array
        },
        errorMessage: 'Invalid Password. Password should not be empty'+
          ' and the length should be 6-20.' // Error message for the parameter
      }
    });

    var errors = req.validationErrors();
    if (errors && errors.length) {
      console.log("errors");
      console.log(errors);

      req.flash('info', errors[0].msg);
      
      return done(null, false);
    }


    process.nextTick(function() {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      console.log("next tick");
      User.findOne({ 'userinfo.local.email' :  email }, function(err, user) {

        console.log("find one");
        // if there are any errors, return the error
        if (err)
          return done(err, false, req.flash('info', 'error'));

        // check to see if theres already a user with that email
        if (user) {
          return done(null, false, req.flash('error', 'The email is already taken.'));
        }

        // if there is no user with that email
        // create the user
        var newUser = new User();

        // set the user's local credentials
        newUser.userinfo.local.email    = email;
        newUser.setPassword(password);


          console.log("ateji id set");
          console.log("use");
          console.log(use_ateji_id + typeof use_ateji_id);
          console.log(ateji_id + typeof ateji_id);

        if(use_ateji_id && ateji_id){
          newUser.ateji_id = ateji_id;
        }
        else{

          console.log("ateji id not set");
          newUser.ateji_id = 0;
        }

        console.log(newUser);

        // save the user
        newUser.save(function(err) {

          console.log("save func");

          if (err){
            console.log("err of save");
            console.log(err);
            throw err;
          }


          console.log(newUser);
          console.log("done func " + done);
          return done(null, newUser);
        });
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) { // callback with email and password from our form
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({'userinfo.local.email' :  email }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err)
      {
        console.log("error occured");
        return done(err);
      }

      // if no user is found, return the message
      if (!user || !user.passwordIsCorrect(password)){
        console.log('authentication failed!!!!!!!!!!!!!!!');
        req.flash('info', 'authentication failed');
        return done(null, false);
      }

      req.flash('info','login success!!!!');
      return done(null, user);
    });
  }));

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

