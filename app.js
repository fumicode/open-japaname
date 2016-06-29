//////////////////dbs//////////////////
var mongoose = require('mongoose'); //はやめじゃないと
var db = require('./models/database.js');

//dbが読み込まれたら、atejilibの方に読み込む
db.db_loaded_promise.then(function(){
  console.log("loading atejilib!!");
  var atejilib = require("./core/atejilib.js");
  atejilib.loadKanjiDB().then(function(){
    console.log("loaded atejilib!!!!");
    console.log(atejilib.getAtejimap());
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
var result = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


app.use(morgan('combined'));
app.use(morgan('dev'));


//////////////////////authentication///////////////////////

// https://www.npmjs.com/package/express-session
//
var session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session); //なんでここでsessionいれるのか謎

var store = new MongoDBStore({
  uri : 'mongodb://localhost/ateji',
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
var characters_router= express.Router(); //新しく作った
  var kanjis_router    = require('./routes/kanjis');
  var words_router     = require('./routes/words');
var contents_router  = require('./routes/contents');
var mypage_router    = require('./routes/mypage');
var auth_router      = require('./routes/auth');
var admin_router     = require('./routes/admin');



app.all('*', function(req, res, next){
  
  var host = req.get('host');

  //nginxにやらせたい！
  if( host == "ateji.net" || host == "www.ateji.jp"){ //!!!!!! jika gaki yokunai.
    res.redirect("http://ateji.jp" + req.url);
  }

  next();
}); 

app.all('*', loadUser); //load user to res.locals.user !!! to show it in topbar
app.all('*', function(req, res, next){
  res.locals.url = req.protocol + '://' + req.get('host') + req.url;
  res.locals.originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  res.locals.path = req.url;
  res.locals.originalPath = req.originalUrl;

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
  characters_router.use('/kanjis',kanjis_router);
  characters_router.use('/words',words_router);
  //characters_router.use('/hiragana',words_router);
  //characters_router.use('/katakana',words_router);
app.use('/contents', contents_router);
app.use('/mypage', loginCheck, mypage_router);
app.use('/auth', auth_router);
app.use('/admin', authorize(["admin"]),  admin_router);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
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
    error: {},
    error_code:err.status || 500
  });
});


