// routes/admin.js

var Album = require('../models/album');
var User = require('../models/user');
var Chart = require('../models/chart');
var Event = require('../models/event');
var Eboarder = require('../models/eboarder');
var Song = require('../models/song');

var express = require('express');
var router = express.Router();

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

module.exports = function(passport){

    // ****** Save albums to database and retrieve all albums ****** //
    router.route('/library')
        .post( function(req,res){
            var album=new Album(req.body);
            console.log(album);

            Album.nextCount(function(err, count) {

                album.save(function(err, result){
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {

                        console.log({message:'Album Added'});

                        Album.find(function(err,albums){
                           if(err) {
                                console.log("There was an error getting the albums: "+err);
                            } else {

                                res.render('library', {
                                    title: 'Library',
                                    albums : albums,
                                    hrID : count,
                                    albumName : result.album,
                                    albumArtist : result.artist,
                                    user : req.user // get the user out of session and pass to template
                                });
                            }
                        });
                    }
                });
            });
        })
        .get( function(req, res) {

            Album.find(function(err,albums){
               if(err) {
                    console.log("There was an error getting the albums: "+err);
                } else {
                    
                    res.render('library', {
                        title: 'Library',
                        albums : albums,
                        hrID : null,
                        albumName : null,
                        albumArtist : null,
                        user : req.user // get the user out of session and pass to template
                    });
                }
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
                    Chart.find().sort({date: -1}).exec(function(err,pastCharts) {
                        if(err) {
                            console.log("there was an error loading charts");
                        } else {
                            res.render('charts', {
                                title: 'Current Charts',
                                moment: moment,
                                charts : charts,
                                pastCharts : pastCharts,
                                week: (pastCharts.length + 1),
                                user : req.user // get the user out of session and pass to template
                            });
                        }
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
                        user : req.user // get the user out of session and pass to template
                    });
                }
            });
        });

    router.route('/events')
        .post( function(req, res){

            var newEvent = new Event();

            //get id from hidden field
            var id = req.body.id;
            console.log('Event: '+id);

            //get data from form inputs
            newEvent.name = req.body.name;
            newEvent.date = req.body.date;
            newEvent.location = req.body.location;
            newEvent.description = req.body.description;

            //newEvent.spam = req.param("spam");

            // date validation
            var start_hour = req.body.start_hour;
            var start_minute = req.body.start_minute;
            var start_AMPM = req.body.start_ampm;
            var start_time = start_hour+":"+start_minute+" "+start_AMPM;

            var end_hour = req.body.end_hour;
            var end_minute = req.body.end_minute;
            var end_AMPM = req.body.end_ampm;
            var end_time = end_hour+":"+end_minute+" "+end_AMPM;

            newEvent.start_time = start_time;
            newEvent.end_time = end_time;

            //if event is new (id is null), save it
            if(id == ''){

                newEvent.save(function(err, result){
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {
                        console.log({message:'Event Added'});
                        res.redirect("back");
                    }
                });

            //otherwise, find it in the database and update it
            } else {
                var query = {"_id": id};
                var update = {name: newEvent.name, 
                                date: newEvent.date, 
                                location: newEvent.location,
                                description: newEvent.description,
                                start_time: newEvent.start_time,
                                end_time: newEvent.end_time };
                var options = {new: true};
                Event.findOneAndUpdate(query, update, options, function(err, event) {
                  if (err) {
                    console.log('error updating event: '+err);
                  }
                  console.log('updated event: '+event);
                  res.redirect('back');
                });
            }

        })
        .get(function(req, res){
            
            Event.find().sort({date: 1}).exec(function(err,events) {
               if(err) {
                    console.log("there was an error loading events");
                } else {
                    res.render('events', {
                        title: 'Event Manager',
                        moment: moment,
                        events : events,
                        user : req.user // get the user out of session and pass to template
                    });
                }
            });
        });

    //for deleting an event
    router.route('/events/:id')
        .post(function(req, res){
            console.log('delete event');
            Event.remove({
                _id: req.params.id
            }, function(err, event) {
                if (err) {
                    console.log('There was an error deleting this event: '+err)
                } else {
                    res.redirect('back');
                }
            });

        });

    router.route('/eboard')
        .post( function(req, res){

            var position = req.body.position;
            console.log("Position is: "+position);

            //if the user selected an eboarder
            if( position ){

                var query = {"position": position};
                var update = { position: position,
                                name: req.body.name,
                                year: req.body.year,
                                show: req.body.show,
                                time: req.body.time,
                                animal: req.body.animal,
                                bands: req.body.bands,
                                concert: req.body.concert,
                                thoughts: req.body.thoughts,
                                interview: req.body.interview
                                };
                var options = {upsert: true};

                Eboarder.findOneAndUpdate(query, update, options, function(err, eboarder) {
                  if (err) {
                    console.log('error updating eboarder: '+err);
                  }
                  console.log('updated eboarder: '+eboarder);
                  res.redirect('back');
                });


            //otherwise, return an error and redirect
            } else {

                console.log('position was null');
                res.redirect('back');
                
            }

        })
        .get(function(req, res){

            console.log(req.user);

            Eboarder.find(function(err,eboarders){
               if(err) {
                    console.log("there was an error loading eboarders");
                } else {
                    res.render('eboard', {
                        title: 'Event Manager',
                        eboarders : eboarders,
                        user : req.user // get the user out of session and pass to template
                    });
                }
            });

        });

    router.route('/stream')
        .post( function(req, res){

            res.redirect('back');

        })
        .get(function(req, res){

            Song.find().sort({id: -1}).exec(function(err,songs){
               if(err) {
                    console.log("there was an error loading songs");
                } else {
                    res.render('stream', {
                        title: 'Radio Stream',
                        moment: moment,
                        songs : songs,
                        user : req.user // get the user out of session and pass to template
                    });
                }
            });

        });

    router.route('/scheduler')
        .post( function(req, res){

            res.redirect('back');

        })
        .get(function(req, res){

            /*Song.find().sort({id: -1}).exec(function(err,songs){
               if(err) {
                    console.log("there was an error loading songs");
                } else {*/
                    res.render('scheduler', {
                        title: 'Scheduler',
                        user : req.user // get the user out of session and pass to template
                    });
                /*}
            });*/

        });

    return router;
}
