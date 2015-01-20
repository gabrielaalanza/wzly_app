// routes/admin.js

var Album = require('../models/album');
var User = require('../models/user');
var Chart = require('../models/chart');
var Event = require('../models/event');
var Eboarder = require('../models/eboarder');
var Song = require('../models/song');
var Schedule = require('../models/schedule');

var express = require('express');
var router = express.Router();

var moment = require('moment');
moment().format();

var paginate = require('express-paginate');

var autoIncrement = require('mongoose-auto-increment');

var json2csv = require('json2csv');
var fs = require('fs');

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

// helper funtions
function getCSV(data, res) {
    json2csv({data: data, fields: ['album', 'artist', 'name', 'time']}, function(err, csv) {
      if (err) console.log(err);
      fs.writeFile('stream.csv', csv, function(err) {
        if (err) {
            throw err;
        } else {
            console.log('file saved');
            var file = 'stream.csv';
            res.download(file);
        }
      });

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
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {

                        console.log({message:'Album Added'});

                        Album.paginate({}, req.query.page, req.query.limit, function(err, pageCount, albums, itemCount) {

                            if (err) return next(err);

                            res.format({
                              html: function() {
                                    res.render('library', {
                                        title: 'Library',
                                        albums : albums,
                                        hrID : count,
                                        albumName : result.album,
                                        albumArtist : result.artist,
                                        pageCount: pageCount,
                                        itemCount: itemCount,
                                        user: req.user
                                    });
                              },
                              json: function() {
                                // inspired by Stripe's API response for list objects
                                res.json({
                                    object: 'list',
                                    has_more: paginate.hasNextPages(req)(pageCount),
                                    data: albums
                                });
                              }
                            });

                        }, { sortBy : { hrID : -1 }});
                        /*
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
                        */
                    }
                });
            });
        })
        .get( function(req, res) {

            Album.paginate({}, req.query.page, req.query.limit, function(err, pageCount, albums, itemCount) {

                if (err) return next(err);

                res.format({
                  html: function() {
                        res.render('library', {
                            title: 'Library',
                            albums : albums,
                            hrID : null,
                            albumName : null,
                            albumArtist : null,
                            pageCount: pageCount,
                            itemCount: itemCount,
                            user: req.user
                        });
                  },
                  json: function() {
                    // inspired by Stripe's API response for list objects
                    res.json({
                        object: 'list',
                        has_more: paginate.hasNextPages(req)(pageCount),
                        data: albums
                    });
                  }
                });

            }, { sortBy : { hrID : -1 }});
            /*
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
            */
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

            var end_hour = req.body.end_hour;
            var end_minute = req.body.end_minute;
            var end_AMPM = req.body.end_ampm;

            if(start_hour == '12') start_hour = 0;
            if(end_hour == '12') end_hour = 0;
            if(start_AMPM == 'PM') start_hour = parseInt(start_hour) + 12;
            if(end_AMPM == 'PM') end_hour = parseInt(end_hour) + 12;

            newEvent.start_time = moment(req.body.date).hour(start_hour).minute(start_minute);
            var end_time = moment(req.body.date).hour(end_hour).minute(end_minute);
            if(start_hour > end_hour) end_time.add(1, 'days');
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
                        title: 'Eboarders',
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

            Song.paginate({}, req.query.page, req.query.limit, function(err, pageCount, songs, itemCount) {

                if (err) return next(err);

                res.format({
                  html: function() {
                        res.render('stream', {
                            title: 'Radio Stream',
                            songs: songs,
                            pageCount: pageCount,
                            itemCount: itemCount,
                            moment: moment,
                            user: req.user
                        });
                  },
                  json: function() {
                    // inspired by Stripe's API response for list objects
                    res.json({
                        object: 'list',
                        has_more: paginate.hasNextPages(req)(pageCount),
                        data: songs
                    });
                  }
                });

            }, { sortBy : { id : -1 }});

        });
    
    router.route('/csv')
        .post( function(req, res){

            console.log('csv requested for date range'+req.body.start+' to '+req.body.end);

            Song.find().lean().sort({id: -1}).exec(function(err,songs) {
               if(err) {
                    console.log("there was an error retrieving songs");
                } else {
                    var start = moment(req.body.start);
                    var end = moment(req.body.end);
                    for (var i = 0; i <= songs.length - 1; i++) {
                        var date = moment(songs[i].date);
                        if(date.isAfter(start) && date.isBefore(end)) {
                            songs[i]['time'] = date.format('MMMM Do YYYY, hh:mm a');
                        } else {
                            songs.splice(i, 1);
                            i--;
                        }
                    };

                    var file = getCSV(songs, res);
                    
                }
            }); 

        })
        .get(function(req, res){

            console.log('csv requested for all dates');

            Song.find().lean().sort({id: -1}).exec(function(err,songs) {
               if(err) {
                    console.log("there was an error retrieving songs");
                } else {

                    for (var i = songs.length - 1; i >= 0; i--) {
                        var date = moment(songs[i].date).format('MMMM Do YYYY, hh:mm a');
                        songs[i]['time'] = date;
                    };

                    var file = getCSV(songs, res);
                }
            });   

        });

    router.route('/scheduler')
        .post( function(req, res){

            //update the schedule
            var query = {"name": "schedule"};
            var update = {"schedule": req.body.schedule};
            var options = {upsert: true};

            Schedule.findOneAndUpdate(query, update, options, function(err, schedule) {
                if (err) {
                    console.log('error updating schedule: '+err);
                } else {
                  console.log('updated schedule');
                }
            });


            var djs = req.body.djs;

            djs.forEach(function(d) {

                var name = d.username;
                var start = parseInt(d.startTime);
                var end = parseInt(d.endTime);
                var day = d.dayOfWeek;

                var q = {};
                q['local.username'] = name;

                var query = User.findOne(q);

                query.exec(function(err, user) {

                    user.showTime.startTime = start;
                    user.showTime.endTime = end;
                    user.showTime.dayOfWeek = day;

                    //save the user
                    user.save(function (err) {
                        if(err) {
                            console.log('error updating djs: '+err);
                        }
                    });

                });
            });

            /****** Old code ******/
            /*
            
            //update the users

            //get list of DJs
            var djs = req.body.djs;
            //console.log("============= List of DJs =============");
            //console.log(req.body.djs);

            for (var i = 0, l = djs.length; i < l; i++) {

                //get username of current DJ
                var name = djs[i].username;
                //set up query
                var query = {};
                query['local.username'] = name;

                //store current DJ
                var dj = djs[i];
                console.log("============= DJ before mongoose =============");
                console.log(dj);

                //find the DJ
                User.findOne(query, function (err, user) {

                    console.log("============= DJ after mongoose =============");
                    console.log(dj);

                    //set the information
                    user.showTime.startTime = parseInt(dj.startTime);
                    user.showTime.endTime = parseInt(dj.endTime);
                    user.showTime.dayOfWeek = dj.dayOfWeek;
                    //console.log("============= User after update =============\n"+user);

                    //save the user
                    user.save(function (err) {
                        if(err) {
                            console.log('error updating djs: '+err);
                        }
                    });
                });
            


                /********** Older code ***********/
                //convert day of week to number?
                /*
                var update = { showTime: 
                    {
                        startTime: parseInt(djs[i].startTime),
                        endTime: parseInt(djs[i].endTime),
                        dayOfWeek: djs[i].dayOfWeek
                    }
                };
                
                console.log(JSON.stringify(update));
                
                User.update({username: djs[i].username}, {$set: update}, function(err, djs){
                    if (err) {
                        console.log('error updating djs: '+err);
                    } else {
                        console.log('DJ show times updated: '+djs);
                    };
                });
                



            };
            
            */

            //check to see which part is giving the 500 error

            Album.paginate({}, req.query.page, req.query.limit, function(err, pageCount, albums, itemCount) {

                if (err) return next(err);

                res.format({
                  html: function() {
                        res.render('library', {
                            title: 'Library',
                            albums : albums,
                            hrID : null,
                            albumName : null,
                            albumArtist : null,
                            pageCount: pageCount,
                            itemCount: itemCount,
                            user: req.user
                        });
                  },
                  json: function() {
                    // inspired by Stripe's API response for list objects
                    res.json({
                        object: 'list',
                        has_more: paginate.hasNextPages(req)(pageCount),
                        data: albums
                    });
                  }
                });

            }, { sortBy : { hrID : -1 }});

        })
        .get(function(req, res){

            Schedule.find(function(err,schedule){
                if(err) console.log("there was an error fetching the schedule");
                User.find(function(err,users){
                    if(err) {
                        console.log("there was an error fetching users");
                    } else {
                        res.render('scheduler', {
                            title: 'Scheduler',
                            schedule: schedule,
                            users: users,
                            user: req.user // get the user out of session and pass to template
                        });
                    }
                })
            });

        });

    return router;
}
