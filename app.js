var co = require("co");
var japaname_jp ="japana.me";

//////////////////dbs//////////////////
var mongoose = require('mongoose'); //はやめじゃないと
var db = require('./models/database.js');

var User = mongoose.model("User");

var authorized_users = {
  "icymasa@gmail.com" : ["admin","kanji-edit", "arton"],
}

function authorizeUser(username, authorities){
  var password = "password";
  return co(function*(){
    console.log("username");
    console.log(username);
    var user = yield User.doesExist(username);
    if(user){
      user.authorities = authorities;
      return yield user.save();
    }
    else{
      User.register(new User({
        username,
        authorities
      }), password, function (err, user) {
        if (err) {
          console.log(err.stack);
          return ;
        } 
        console.log(user);
      });
    }
  });
}

co(function*(){
  for(user in authorized_users) {
    authorization = authorizeUser(user, authorized_users[user])
  }
});

//dbが読み込まれたら、atejilibの方に読み込む
db.db_loaded_promise.then(function(){
  console.log("loading atejilib..");
  var atejilib = require("./core/atejilib.js");


  atejilib.loadKanjiDB().then(function(){
    console.log("loaded atejilib!!");

        }).catch((err)=>{
      console.log(err.stack);
    });
});


//////////////////basics//////////////////
var express = require('express');
var validator = require('express-validator');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride= require('method-override');
var map = require("express-sitemap");

//var livereload = require('connect-livereload')

//////////////////app obj//////////////////
var app = module.exports = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.basedir = path.join(__dirname, 'views');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator({}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(methodOverride("_method"));
//app.use(livereload());



//prevent 304
//app.disable('etag');

///////////////////////LOGGING/////////////////////////

var fs = require('fs');
var morgan = require('morgan');

var logDirectory = __dirname + '/logs';


//var logger = new winstonjjk


//var logger = require("./util/logger.js");


//logger.log('debug', 'log by logger');
//logger.lovel = "debug";
//logger.log('debug', 'log by logger again');

//logger.log('info', 'log by logger');

//ensure log directory exists
//
var result = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


app.use(morgan('combined'));
app.use(morgan('dev'));

//////////////////////authentication///////////////////////
// https://www.npmjs.com/package/express-session


var session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session); //なんでここでsessionいれるのか謎

var store = new MongoDBStore({
  uri : db.db_url,
  collection: 'mySessions',
  //clear_interval: 60
});

var passport = require("passport");
var flash    = require("connect-flash");


app.use(session({ // ???? using session and passport.session?
  secret: 'secreadsfadfat',
  store: store,
  saveUninitialized: true,
  resave:true,
  cookie: {
    httpOnly: false,
    maxAge: new Date(Date.now() + 60 * 60 * 100000)
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


require("./auth/setup_passport.js")(passport); //RUN setup function
var authModule = require("./auth/authModule.js");
var loginCheck = authModule.loginCheck;
var authorize = authModule.authorize;
var loadUser = authModule.loadUser;




//////////////////routes//////////////////
var routes    = require('./routes/index');
var users_router     = require('./routes/users');
var names_router     = require('./routes/names');
var characters_router= require("./routes/characters");
var funding_router     = require('./routes/funding');
var contents_router  = require('./routes/contents');
var mypage_router    = require('./routes/mypage');
var auth_router      = require('./routes/auth');
var thumbnail_router      = require('./routes/thumbnail');
var artworks_router     = require('./routes/artworks');
var shops_router = require('./routes/shops');
var purchases_router = require('./routes/purchases');
var admin_router     = require('./routes/admin');
var api_router = require("./routes/api");


app.all('*', function(req, res, next){
  
  //nginxにやらせたい！
  //と思ってたけど、amazon load balancerが3001までやってくれるので、ぉk
  
  //リダイレクトの繰り返しになってしまう
  //if(req.hostname == "japaname.jp" && req.protocol == "http"){
    //return res.redirect("https://japaname.jp" + req.url);
  //}

  var host = req.hostname;

  console.log("req.protocol");
  console.log(req.protocol);
  
  if(host == "japaname.jp" || 
     host == "japaname.tokyo" || 
     host == "ateji.me" 
  ){ //!!!!!! jika gaki yokunai.
    return res.redirect("http://" + japaname_jp + req.url);
  }

  next();
}); 

app.all('*', loadUser); //load user to res.locals.user !!! to show it in topbar
app.all('*', function(req, res, next){
  res.locals.url = 'https://' + req.hostname + req.url;
  res.locals.originalUrl = 'https://' + req.hostname + req.originalUrl;

  res.locals.path = req.url;
  res.locals.originalPath = req.originalUrl;

  res.locals.host= req.hostname;

  res.locals.err_message = req.flash('error');
  res.locals.alert_message = req.flash('alert');
  res.locals.notice_message = req.flash('info');
  res.locals.success_message = req.flash('success');

  next();
}); 

app.use('/', routes);
app.use('/users', users_router);
app.use('/names', names_router);
app.use('/characters',characters_router);

app.use('/funding', funding_router);
app.use('/contents', contents_router);
app.use('/mypage', loginCheck, mypage_router);
app.use('/auth', auth_router);
app.use('/thumbnail', thumbnail_router);
app.use('/artworks', artworks_router ); // loginCheck ,
app.use('/shops', shops_router ); // loginCheck ,
app.use('/purchases', loginCheck, purchases_router); // loginCheck,
app.use('/admin', authorize(["admin"]),admin_router);
app.use('/api', api_router);




(function(){
  var sitemap = map({
    http:"https",
    url:japaname_jp,
    map:{
      '/': ['get'],
      '/names': ['get'],
      '/characters': ['get'],
      '/characters/hiraganas': ['get'],
      '/characters/katakanas': ['get'],
      '/characters/kanjis': ['get'],
      '/stylesheets': ['get'],
      '/javascripts': ['get'],
      '/images': ['get'],
      '/admin': ['get'],
      '/auth': ['get'],
      '/artworks': ['get'],
    },
    route: {
        '/names': {
          priority:1.0,
          changefreq: 'monthly',
        },
        '/characters': {
          priority:0.5,
          changefreq: 'monthly',
        },
        '/admin': { disallow: true, },
        '/auth': { disallow: true, },
        '/artworks': { disallow: true, },
        '/stylesheets': { disallow: true, },
        '/javascripts': { disallow: true, },
        '/images': { disallow: true, },
    },
  });

  sitemap.XMLtoFile(path.join(__dirname,"/public/sitemap.xml"));
  sitemap.TXTtoFile(path.join(__dirname,"/public/robots.txt"));

}());
  




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;

  res.status(err.status);
  res.render("error",{
    error_message: "Not Found",
    error_code:err.status
  });
});

// error handlers
// development error handler
// will print stacktrace

console.log ( "starting with " +  app.get('env') + " mode");
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      error_message: err.message,
      error: err,
      error_code:err.status || 500
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    error_message: err.message,
    error: null,
    error_code:err.status || 500
  });
});


