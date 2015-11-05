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
//var configDB = require('./config/database.js');
//provide a sensible default for local development
var mongodb_connection_string = 'localhost:27017/wzly_db';
//var mongodb_connection_string = 'mongodb://admin:electricladyland@ds051831.mongolab.com:51831/heroku_app34231140';

// ** Moment ** //
var moment = require('moment');
moment().format();

// ** Later ** //
var later = require('later');

// ** Pagination ** //
var mongoosePaginate = require('mongoose-paginate');
var paginate = require('express-paginate');

// ** JSON to CSV ** //
var json2csv = require('json2csv');

// ** Nodemailer ** //
var nodemailer = require('nodemailer');

// ** For password reset ** //
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');

// ** For S3 ** //
var aws = require('aws-sdk');
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET


var app = express();

// pagination setup
app.use(paginate.middleware(10, 50));

// db configuration ==========================================================
mongoose.connect(mongodb_connection_string); // connect to our database
mongoose.connection.on('error', console.log);

autoIncrement.initialize(mongoose.connection);

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

//var routes = require('./routes/index')(passport);
//app.use('/', routes);

/***********************/

// CORS
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// require routes
var routes = require('./routes/routes')(passport);
var admin = require('./routes/admin')(passport);
var dj = require('./routes/dj')(passport);
var automation = require('./routes/automation')(passport);
var api = require('./routes/api')(passport);

//var pass = require('./config/passport'); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
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
var MongoStore = require('connect-mongo')(session);
app.use(session({cookie: { path: '/', httpOnly: true, maxAge: null}, secret: 'eLecTr!cL@d!Ez', saveUninitialized: true, resave: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }) })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/', routes);
app.use('/admin', admin);
app.use('/app', dj);
app.use('/auto', automation);
app.use('/api', api);

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
