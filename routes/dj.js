// routes/dj.js

var Album = require('../models/album');
var User = require('../models/user');
var Song = require('../models/song');

var express = require('express');
var router = express.Router();

var util = require("util"); 
var fs = require("fs"); 
var path = require('path');
var aws = require('aws-sdk');
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET_NAME;

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

            var query = {'_id': req.user._id};

            var update = {
                bio: req.body.bio,
                picture: req.body.avatar_url,
                bands: {
                    band1: req.body.band1,
                    band2: req.body.band2,
                    band3: req.body.band3,
                    band4: req.body.band4,
                    band5: req.body.band5
                    }
                }

            var nameArr = [];
            for (var i in req.body) {
                if(i.indexOf('showName')>=0) {
                    var index = i.split('-');
                    index = index[1];
                    nameArr.push({'name':req.body[i], 'index': index});
                }
            }
            console.log(nameArr);

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

            User.findOneAndUpdate(query, update, function(err, user) {
                console.log('USER!');
                console.log(user);
              if (err) {
                console.log('error updating user: '+err);
              } else {
                  console.log('updated user');
                  for(i in nameArr) {
                    user.show[nameArr[i].index].showName = nameArr[i].name;
                    user.save(function(err, result){
                        if(err) {
                            console.log('error saving ('+user.local.username+') show name: '+err);
                        } else {

                            console.log(user.local.username+"'s show name has been saved \n");
                        }
                    });
                  }
              }
              res.redirect('back');
            });

        })
        .get(isAuthenticated, function(req, res){

            if(req.user.local.name) title = req.user.local.name;
            else title = req.user.local.username;

            res.render('profile', {
                title: title + "'s Profile",
                user : req.user // get the user out of session and pass to template
            });


        });

    router.get('/sign_s3', function(req, res){
        aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: S3_BUCKET,
            Key: 'djs/'+req.user.id+path.extname(req.query.s3_object_name).toLowerCase(),
            Expires: 60,
            ContentType: req.query.s3_object_type,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3_params, function(err, data){
            if(err){
                console.log(err);
            }
            else{
                var return_data = {
                    signed_request: data,
                    url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/djs/'+req.user.id+path.extname(req.query.s3_object_name).toLowerCase()
                };
                res.write(JSON.stringify(return_data));
                res.end();
            }
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
                })
            }

            //save the song
            var song = new Song();
            song.name = req.body.name;
            song.artist = req.body.artist;
            song.album = req.body.album;
            song.playedBy = req.user.local.username;

            var position;

            Song.nextCount(function(err, count) {

                song.save(function(err, result){
                    if(err) {
                        console.log("There was an error adding this song: "+err);
                    }
                });

                position = count;

                //then, update user profile to claim this song in playlist
                var query = {'_id': req.user.id};

                User.findOne(query, function(err, user) {

                    //get the playlist

                    var playlist = user.playlists[user.playlists.length-1];

                    //check to see if this is the first song in the playlists
                    if(typeof playlist.startIndex == 'undefined') {
                        //if so, update the start and end index
                        playlist.startIndex = position;
                        playlist.endIndex = position;

                    } else {
                        //if not, update the end index
                        playlist.endIndex = position;
                    }

                    user.save(function(err, result){
                        if(err) {
                            console.log('error saving ('+user.local.username+') playlist index: '+err);
                        }
                    });

                });

                res.redirect('back');
            });

            
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

    router.route('/edit-description/:id')
        .post(isAuthenticated, function(req, res){

            var query = {'_id': req.user.id};

            User.findOne(query, function(err, user) {

                var id = req.params.id;

                for (var i = user.playlists.length - 1; i >= 0; i--) {
                    if(id == user.playlists[i]._id) {
                        var playlist = user.playlists[i];
                    }
                };

                if(req.body.name) { 
                    playlist.name = req.body.name;
                } else {
                    playlist.name = null;
                }
                if(req.body.description){
                    playlist.description = req.body.description;
                } else { 
                    playlist.description = null;
                }

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
            var show = req.body.show;
            console.log("show");
            console.log(show);

            User.findOne(query, function(err, user) {

                user.live = true;

                var currentDate = new Date;
                var playlist = {
                    date: currentDate,
                    showName: show
                }

                user.playlists.push(playlist);

                user.save(function(err, result){
                    if(err) {
                        console.log('error setting user ('+user.local.username+') to live: '+err);
                    } else {
                        console.log(user.local.username+' is now live');
                    }
                });

            });

            res.redirect('/app/log');
        });

    router.route('/finish-playlist')
        .post(isAuthenticated, function(req, res){

            //change live status to "false"

            var query = {'_id': req.user.id};

            User.findOne(query, function(err, user) {

                user.live = false;

                user.save(function(err, result){
                    if(err) {
                        console.log('error finishing playlist for '+user+': '+err);
                    } else {

                        console.log(user.local.username+' is no longer live');
                    }
                });

            });

            res.redirect('back');
        });

    return router;
}
