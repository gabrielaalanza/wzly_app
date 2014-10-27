// routes/admin.js

var Album = require('../models/album');
var User = require('../models/user');
var Chart = require('../models/chart');

var express = require('express');
var router = express.Router();

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

function renderLibrary(req, res) {
    Album.find(function(err,albums){
       if(err) {
            console.log("There was an error getting the albums: "+err);
        } else {
            req.session.library = {
                albums : albums,
                hrID : req.hr.hrID,
                albumName : req.hr.albumName,
                albumArtist : req.hr.albumArtist,
                user : req.session.user // get the user out of session and pass to template
            };
            res.redirect('back');
            /*
            res.render('library', {
                title: 'Library',
                albums : albums,
                hrID : req.hr.hrID,
                albumName : req.hr.albumName,
                albumArtist : req.hr.albumArtist,
                user : req.user // get the user out of session and pass to template
            });
*/
        }
    });
}

function getAlbums(req, res, callback) {
    Album.find(function(err,albums){
       if(err) {
            console.log("There was an error getting the albums: "+err);
            return "There are no albums to display";
        } else {
            req.session.library = {
                albums : albums
            };
            callback();
        }
    });
}

module.exports = function(passport){

    // ****** Save albums to database and retrieve all albums ****** //
    router.route('/library')
        .post( function(req,res){
            var album=new Album(req.body);
            console.log(album);

            Album.nextCount(function(err, count) {

                album.save(function(err, result){
                    if(err)
                        console.log("This is an error: "+err);
                    else

                        console.log({message:'Album Added'});


                        req.session.hr = { 
                            hrID : count,
                            albumName : result.album,
                            albumArtist : result.artist 
                        };

                        req.session.library = {
                            albums : getAlbums(),
                        };

                        req.session.user = req.session.user; // get the user out of session and pass to template
            
                        res.redirect('back');

                        //req.flash('hrID', result.album + ' by ' + result.artist + ' is #' + count + '.');
                        //res.redirect('/library');
                      /*
                      res.render('library', {
                        hrID : count,
                        albumName : result.album,
                        albumArtist : result.artist,
                        user : req.user // get the user out of session and pass to template
                    });
                    */
                });
            });
        })
        .get( function(req, res) {

            req.session.hr = { 
                hrID : null,
                albumName : null,
                albumArtist : null 
            };


            getAlbums(req, res, function(){

                req.session.lib = [{"_id":"5413beea376b1d5f82f90724","album":"The Suburbs","artist":"Arcade Fire","__v":0,"count":"0"},
                {"_id":"541499ff517a2d27908f1315","album":"Turn Blue","artist":"The Black Keys","__v":0,"count":"0"},
                {"_id":"54149a7477f3c94c9007c997","album":"Stay Gold","artist":"First Aid Kit","__v":0,"count":"0"}];
                //res.json(req.session.library.albums);
                res.render('library',
                    { user : req.session.user } // get the user out of session and pass to template)
                );
            });

        });

    // ****** Get albums from database ****** //
    router.route('/charts')
        .post( function(req, res) {
            chart = new Chart();

            Album.find().sort({count: 1}).exec(function(err,charts){
               if(err) {
                    console.log("there was an error loading charts");
                } else {
                    for (var i = charts.length - 1; i >= 0; i--) {
                        var chartArtist = charts[i].artist;
                        var chartAlbum = charts[i].album;
                        var chartCount = charts[i].count;

                        var alb = {artist: chartArtist, album: chartAlbum, count: chartCount};
                        (chart.list).push(alb);
                    };

                    chart.save(function(err){
                        if(err) {
                            console.log("This is an error: "+err);
                        } else {
                            Album.update({ 'count': { $gt: 0 } }, { $set: { 'count': '0' } }, {multi: true}, function(err, result){
                                console.log(result);

                                if(err)
                                    console.log("Count not update charts count: "+err);

                                res.redirect('back');
                            });
                        }   
                    })
                    
                }
            })

        })
        .get( function(req, res) {

            Album.find().sort({count: -1}).exec(function(err,charts){
               if(err) {
                    console.log("there was an error loading charts");
                } else {
                    res.render('charts', {
                        title: 'Current Charts',
                        charts : charts,
                        user : req.session.user // get the user out of session and pass to template
                    });
                }
            })
        });
    

    // ****** Get all users from database ****** //
    router.route('/users')
        .get( function(req, res) {

            User.find(function(err,users){
               if(err) {
                    console.log("there was an error loading users");
                } else {
                    res.render('users', {
                        title: 'Current DJs',
                        users : users,
                        user : req.session.user // get the user out of session and pass to template
                    });
                }
            });
        });

    return router;
}
