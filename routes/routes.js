// routes/routes.js
var express = require('express');
var router = express.Router();

var User = require('../models/user');

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
        return res.redirect('/login'); 
      }
      if(user.local.username == "admin") {
        console.log(user);
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/admin/library');
        });
      } else {
        console.log(user);
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/app/profile');
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

return router;
}