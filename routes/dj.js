// routes/dj.js

var Album = require('../models/album');
var User = require('../models/user');
var Song = require('../models/song');

var express = require('express');
var router = express.Router();

var util = require("util"); 
var fs = require("fs"); 
var path = require('path')

var autoIncrement = require('mongoose-auto-increment');


// ****** Check to see if user is authenticated ****** //

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
}

function optionalString(pref, fallback) {
    if (!pref) {
        return fallback;
    } else {
        return pref;
    }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = function(passport){

// ****** Edit DJ profile ****** //

    router.route('/profile')
        .post( function(req, res){

            console.log("bio: "+req.body.bio);

            var query = {'_id': req.user._id};

            var update = {
                local: {
                    name: req.body.name,
                    username: req.user.local.username
                },
                showName: req.body.showName,
                //picture: req.body.picture,
                bio: optionalString(req.body.bio," "),
                bands: {
                    band1: optionalString(req.body.band1, " "),
                    band2: optionalString(req.body.band2, " "),
                    band3: optionalString(req.body.band3, " "),
                    band4: optionalString(req.body.band4, " "),
                    band5: optionalString(req.body.band5, " ")
                    }
                }

            var options = { overwrite: false };

            if (!isEmpty(req.files)) { 
                //console.log('files: '+util.inspect(req.files));

                if (req.files.picture.size === 0) {
                    console.log("No file attached");
                }

                fs.exists(req.files.picture.path, function(exists) { 

                    if(exists) { 
                        var tempPath = req.files.picture.path;
                        
                        var targetPath = 'public/images/dj/'+req.user.local.username+path.extname(req.files.picture.name).toLowerCase();
                        
                        fs.rename(tempPath, targetPath, function(err) {
                            if (err) throw err;
                            console.log("Profile picture upload completed!");
                        });

                        var finalPath = '/images/dj/'+req.user.local.username+path.extname(req.files.picture.name).toLowerCase();

                        var url = finalPath;
                        update['picture'] = url;

                        User.update(query, update, options, function(err, user) {
                          if (err) {
                            console.log('error updating user: '+err);
                          }
                          console.log('updated user: '+user);
                          res.redirect('back');
                        });

                    } else { 
                        console.log("Well, there is no magic for those who don’t believe in it!"); 
                    } 
                }); 
            } else {
                console.log("update: "+update);

                User.update(query, update, options, function(err, user) {
                  if (err) {
                    console.log('error updating user: '+err);
                  }
                  console.log('updated user: '+user);
                  res.redirect('back');
                });
            }

        })
        .get(function(req, res){

            console.log(req.user);

            res.render('profile', {
                title: req.user.local.username + "'s Profile",
                user : req.user // get the user out of session and pass to template
            });


        });

    router.route('/log')
        .post( function(req, res){

            //first, if necessary, update the HR album count
            //then, store the song in memory
            //then, update playlist tracker

            console.log(req.body);

            //if hr
            if(req.body.hrID) {
                var query = {'hrID': req.body.hrID};
                var update = { $inc: { count: 1 }};
                var options = { overwrite: false };

                Album.update(query, update, function(err, album){
                    if (err) {
                        console.log('error updating album play count: '+err);
                    }
                    console.log('updated play count of album: '+album);
                })
            }

            //save the song
            var song = new Song();
            song.name = req.body.name;
            song.artist = req.body.artist;
            song.album = req.body.album;

            console.log("Saving song: "+song)

            Song.nextCount(function(err, count) {

                song.save(function(err, result){
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {

                        console.log({message:'Song Added'});
                    }
                });
                console.log("Song position: "+count);
            });

            //then, update user profile to claim this song in playlist
            var query = {'_id': req.user.id};
            var update = {};
            var options = {$set: {author:"Jessica"}};

            res.redirect('back');
        })
        .get(function(req, res){

            console.log(req.user);

            res.render('log', {
                title: "Music Log",
                user : req.user // get the user out of session and pass to template
            });

        });

    return router;
}
