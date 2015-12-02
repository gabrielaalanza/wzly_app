// routes/routes.js
var express = require('express');
var router = express.Router();

var User = require('../models/user');

var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var isAuthenticated = function (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler 
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated())
    return next();
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/login');
}

module.exports = function(passport){

  /* GET login page. */
  router.get('/login', function(req, res) {
      // Display the Login page with any flash message, if any
    res.render('login', { message: req.flash('message') });
  });

  /* Handle Login POST */
  router.post('/login', function(req, res, next) { 
    passport.authenticate('login', function(err, user, info) {
      if (err) { 
        return next(err); 
      }
      if (!user) { 
        //return res.redirect('/login'); 
        return res.send('No account with that username exists. Contact the executive board.'); 
      }
      if(user.local.username == "admin") {
        console.log("logging in: "+user.local.username);
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.send({redirect: '/admin/library'});
        });
      } else {
        console.log("logging in: "+user.local.username);
        req.logIn(user, function(err) {
          
          if (err) { return next(err); }

          //double check that users are not live
          user.live = false;

          user.save(function(err, result){
            if(err) {
                console.log('error setting user ('+user.local.username+') to not live: '+err);
            } else {
                console.log('double checked that '+user.local.username+' is not live');
            }
          });

          return res.send({redirect: '/app/profile'});
        });
      }
    })(req, res, next);
  });

  /* Handle Registration POST */
  router.get('/signup', function(req, res) {
    res.redirect('back');
  });

  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/admin/users',
    failureRedirect: '/admin/library',
    failureFlash : true  
  }));

  /* Handle Logout */
  router.get('/logout', function(req, res) {

    var query = {'_id': req.user.id};

    User.findOne(query, function(err, user) {

      if(user.live) {

        user.live = false;

        user.save(function(err, result){
            if(err) {
                console.log('error setting user ('+user+') to not live: '+err);
            } else {
                console.log(user+' is now no longer live');
            }
        });

      }

    });

    req.logout();
    res.redirect('/login');
  });

  /* Contact form */
  router.post('/contact', function(req, res) {
    var mailOpts, smtpTrans;

    //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.
    smtpTrans = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: "airwave.app@gmail.com",
            pass: "ijkvzqoolyxammqj" 
        }
    });
    //Mail options
    mailOpts = {
        from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
        to: 'glanza@wellesley.edu',
        subject: 'Interface Feedback from '+req.body.name+' at '+ req.body.email,
        text: req.body.message
    };

    console.log(mailOpts);

    smtpTrans.sendMail(mailOpts, function (error, response) {
        //Email not sent
        if (error) {
            console.log(error);
            res.send(error);
        }
        res.end();
        //Yay!! Email sent
    });
  });

/* Handle Password reset */

router.route('/reset/:token')
  .post(function(req, res){

      User.findOne({ 'local.resetPasswordToken': req.params.token}, function(err, user) {
          if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
          }

          user.local.password = req.body.password;
          user.local.resetPasswordToken = undefined;

          user.save(function(err) {
            if (err) { return next(err); }
            req.logIn(user, function(err) {
              if (err) { return next(err); }
              return res.redirect('/app/profile');
            });
          });
      });

  })
  .get(function(req, res){
      User.findOne({ 'local.resetPasswordToken': req.params.token }, function(err, user) {
          if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('/login');
          }
          res.render('reset', {
              title: 'Set your password',
              user: req.user
          });
      });

  });

  router.route('/forgot-password')
    .post(function(req, res){

      async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ 'local.username': req.body.username }, function(err, user) {
            if (!user) {
              res.send('No account with that username exists. Contact the executive board.');
              // send error message
            } else {
              user.local.resetPasswordToken = token;

              user.save(function(err) {
                done(err, token, user);
              });
            }
          });
        },
        function(token, user, done) {
          var smtpTransport = nodemailer.createTransport('SMTP', {
            service: 'Gmail',
            auth: {
              user: 'airwave.app@gmail.com',
              pass: 'ijkvzqoolyxammqj'
            }
          });
          var mailOptions = {
            to: user.local.email,
            from: 'airwave.app@gmail.com',
            subject: 'Reset your Airwave Password',
            text: 'Hello '+user.local.name+',\n\n'+
              "Don't worry too much about your password. Mistakes happen.\n\n" +
              'Please click on the following link, or paste this into your browser to reset it:\n\n' +
              'http://'+req.headers.host+'/reset/' + token + '\n\n' +
              'Thanks,\n'+'Airwave'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            done(err, 'done');
            res.end();
          });
        }
      ], function(err) {
        if (err) {
          console.log(err);
          //send error message
          res.send('There was an error resetting your password. Please try again later or check with the admin.');
        } 
        res.end();
      });

  })
  .get(function(req, res){

    res.render('forgot', {
        title: 'Forgot your password?'
    });

  });
/*
  router.get('/log-automated/:data', function(req, res) {
    console.log(req.params);
  });

  router.post('/log-automated', function(req, res) {
    console.log("here post")
  });
*/

return router;
}