var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport){

	passport.use('admin', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check if username and password are correct

                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log the error and redirect back
                if (username != "admin"){
                    console.log('Username '+username+' was not correct for admin login.');
                    return done(null, false, req.flash('message', 'User Not found.'));                 
                }
                // User exists but wrong password, log the error 
                if (password != 'wellesleyzly'){
                    console.log('Invalid Password');
                    return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                }
                // User and password both match, return user from done method
                // which will be treated like success
                var user = {name: "Admin", username: "admin"};
                return done(null, user);

        })
    })
    
)}