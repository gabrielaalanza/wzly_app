// routes/dj.js

var Album = require('../models/album');
var User = require('../models/user');
var Song = require('../models/song');

var express = require('express');
var router = express.Router();

var util = require("util"); 
var fs = require("fs"); 
var path = require('path');

var moment = require('moment');
moment().format();

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
        .post(isAuthenticated, function(req, res){

            console.log("bio: "+req.body.bio);

            var query = {'_id': req.user._id};

            var update = {
                local: {
                    name: req.body.name,
                    username: req.user.local.username
                },
                showName: req.body.showName,
                bio: req.body.bio,
                bands: {
                    band1: req.body.band1,
                    band2: req.body.band2,
                    band3: req.body.band3,
                    band4: req.body.band4,
                    band5: req.body.band5
                    }
                }

            //this might not work
            //delete undefined properties from update
            for (var i in update) {
              if (update[i] === null || update[i] === undefined) {
                delete update[i];
              }
            }

            //delete undefined properties from bands
            for (var i in update.bands) {
              if (update.bands[i] === null || update.bands[i] === undefined) {
                delete update.bands[i];
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
        .get(isAuthenticated, function(req, res){

            console.log(req.user);

            res.render('profile', {
                title: req.user.local.username + "'s Profile",
                user : req.user // get the user out of session and pass to template
            });


        });

    router.route('/log')
        .post(isAuthenticated, function(req, res){

            //first, if necessary, update the HR album count
            //then, store the song in memory
            //then, update playlist tracker

            //if hr
            if(req.body.hrID) {
                var query = {'hrID': req.body.hrID};
                var update = { $inc: { count: 1 }};
                var options = { overwrite: false };

                Album.update(query, update, function(err, album){
                    if (err) {
                        console.log('error updating album play count: '+err);
                    }
                    console.log('updated play count of album: '+album.name+'\n');
                })
            }

            //save the song
            var song = new Song();
            song.name = req.body.name;
            song.artist = req.body.artist;
            song.album = req.body.album;

            console.log("Saving song: "+song+'\n');

            var position;

            Song.nextCount(function(err, count) {

                song.save(function(err, result){
                    if(err) {
                        console.log("There was an error adding this song: "+err);
                    } else {

                        console.log('Song Added');
                    }
                });
                console.log("Song position is: "+count+'\n');
                position = count;
            });

            //then, update user profile to claim this song in playlist
            var query = {'_id': req.user.id};

            User.findOne(query, function(err, user) {

                //get the playlist

                var playlist = user.playlists[user.playlists.length-1];
                console.log("Playlist: "+playlist+'\n');

                //check to see if this is the first song in the playlists
                if(typeof playlist.startIndex == 'undefined') {
                    //if so, update the start index
                    playlist.startIndex = position;

                } else {
                    //if not, update the end index
                    playlist.endIndex = position;
                }

                user.save(function(err, result){
                    if(err) {
                        console.log('error saving ('+user.local.username+') playlist index: '+err);
                    } else {

                        console.log(user.local.username+"'s playlist has been saved \n");
                    }
                });

            });

            res.redirect('back');
        })
        .get(isAuthenticated, function(req, res){

            res.render('log', {
                title: "Music Log",
                user : req.user // get the user out of session and pass to template
            });

        });

    router.route('/description')
        .post(isAuthenticated, function(req, res){

            var query = {'_id': req.user.id};

            User.findOne(query, function(err, user) {

                //get the playlist
                var playlist = user.playlists[user.playlists.length-1];
                console.log("Playlist: "+playlist+'\n');

                if(req.body.name) playlist.name = req.body.name;
                if(req.body.description) playlist.description = req.body.description;

                user.save(function(err, result){
                    if(err) {
                        console.log('error saving ('+user.local.username+') playlist description: '+err);
                    } else {

                        console.log(user.local.username+"'s playlist name/description has been saved \n");
                    }
                });

            });

            res.redirect('back');
        })
        .get(isAuthenticated, function(req, res){

            res.render('log', {
                title: "Music Log",
                user : req.user // get the user out of session and pass to template
            });

        });

    router.route('/playlists')
        .get(isAuthenticated, function(req, res){

            Song.find(function(err,songs){
               if(err) {
                    console.log("there was an error loading songs");
                } else {
                    res.render('playlists', {
                        title: 'Past Playlists',
                        moment: moment,
                        songs : songs,
                        user : req.user // get the user out of session and pass to template
                    });
                }
            });

        });

    router.route('/go-live')
        .post(isAuthenticated, function(req, res){

            //change live status to "true"
            //create new playlist and add it to the user's list of playlists

            var query = {'_id': req.user.id};

            User.findOne(query, function(err, user) {

                user.live = true;

                var currentDate = new Date;
                var playlist = {
                    date: currentDate 
                }

                user.playlists.push(playlist);

                user.save(function(err, result){
                    if(err) {
                        console.log('error setting user ('+user+') to live: '+err);
                    } else {
                        console.log(user+' is now live');
                    }
                });

            });

            res.redirect('back');
        });

    router.route('/finish-playlist')
        .post(isAuthenticated, function(req, res){

            //change live status to "true"
            //create new playlist and add it to the user's list of playlists

            var query = {'_id': req.user.id};

            User.findOne(query, function(err, user) {

                user.live = false;

                user.save(function(err, result){
                    if(err) {
                        console.log('error setting finishing playlist for '+user+': '+err);
                    } else {

                        console.log(user+' is no longer live');
                    }
                });

            });

            res.redirect('back');
        });

    return router;
}
