//app.js

// ** Load in our dependencies **
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var path = require('path');

// ** Passport **
var passport = require('passport');
var session      = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var flash    = require('connect-flash');

// ** MongoDB Setup **
var mongo = require('mongodb');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var configDB = require('./config/database.js');

var app = express();

// db configuration ==========================================================
mongoose.connect(configDB.url); // connect to our database
mongoose.connection.on('error', console.log);

autoIncrement.initialize(mongoose.connection);

/****** JUST ADDED ******/

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

//var routes = require('./routes/index')(passport);
//app.use('/', routes);

/***********************/


/*app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
*/
// require routes
var routes = require('./routes/routes')(passport);
var admin = require('./routes/admin')(passport);
var dj = require('./routes/dj')(passport);

//var pass = require('./config/passport'); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({
    dest: './public/images/uploads'
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var methodOverride = require('method-override')
// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'))

// required for passport
app.use(session({ secret: 'eLecTr!cL@d!Ez' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

/*app.get('*', function(req, res, next) {
  // put user into res.locals for easy access from templates
  res.locals.lib = req.lib;

  next();
});*/

app.use('/', routes);
app.use('/admin', admin);
app.use('/app', dj);

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
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
