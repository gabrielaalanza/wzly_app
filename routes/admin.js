// routes/admin.js

var Album = require('../models/album');
var User = require('../models/user');
var Chart = require('../models/chart');
var Event = require('../models/event');
var Song = require('../models/song');
var Schedule = require('../models/schedule');

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

var paginate = require('express-paginate');

var autoIncrement = require('mongoose-auto-increment');

var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var json2csv = require('json2csv');
var fs = require('fs');

// ****** Check to see if user is authenticated ****** //

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated() && req.user.eboard.position)
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
        .post(isAuthenticated, function(req,res){
            var album=new Album(req.body);
            console.log(album);

            Album.nextCount(function(err, count) {

                album.save(function(err, result){
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {

                        console.log({message:'Album Added'});

                        var data = { hrID : count,
                                    albumName : result.album,
                                    albumArtist : result.artist };

                        res.send(data);

                    }
                });
            });
        })
        .get(isAuthenticated, function(req, res) {

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

        });

    // ****** Get albums from database ****** //
    router.route('/charts')
        .post(isAuthenticated, function(req, res) {
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
        .get(isAuthenticated, function(req, res) {

            Album.paginate({}, req.query.page, req.query.limit, function(err, pageCount, charts, itemCount) {

                if (err) return next(err);

                Chart.find().sort({date: 1}).exec(function(err,pastCharts) {
                        if(err) {
                            console.log("there was an error loading charts");
                        } else {
                            res.format({
                              html: function() {
                                    res.render('charts', {
                                        title: 'Current Charts',
                                        moment: moment,
                                        charts : charts,
                                        pastCharts : pastCharts,
                                        week: (pastCharts.length + 1),
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
                        }
                    });

            }, { sortBy : { count : -1 }});

        });
    

    // ****** Get all users from database ****** //
    router.route('/users')
        .post(isAuthenticated, function(req,res){
            // find a user in Mongo with provided username
            User.findOne({ 'local.username' :  req.body.username }, function(err, user) {
                // In case of any error, return using the done method
                if (err){
                    console.log('Error in SignUp: '+err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: '+req.body.username);
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.local.username = req.body.username;
                    newUser.local.name = req.body.name;
                    if(req.body.position) newUser.eboard.position = req.body.position;
                    if(req.body.email) newUser.local.email = req.body.email;
                    else newUser.local.email = req.body.username + '@wellesley.edu';


                    console.log("This is the email: "+newUser.local.email);

                    // save the user
                    newUser.save(function(err) {
                        if (err){
                            console.log('Error in Saving user: '+err);
                        } else {
                            console.log('User Registration succesful'); 
                        }
                    });

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
                              req.flash('error', 'No account with that username exists.');
                              // send error message
                              return res.redirect('/users');
                            }

                            user.local.resetPasswordToken = token;

                            user.save(function(err) {
                              done(err, token, user);
                            });
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
                            subject: 'Set your Airwave Password',
                            text: 'Hello '+user.local.name+',\n\n'+
                              'You are receiving this because you have been added as a user in Airwave by a WZLY administrator. Your next step is to create a password for your account.\n\n' +
                              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                              'http://'+req.headers.host+'/reset/' + token + '\n\n' +
                              'Thanks,\n'+'Airwave'
                          };
                          smtpTransport.sendMail(mailOptions, function(err) {
                            done(err, 'done');
                            res.end();
                          });
                        }
                      ], function(err) {
                        if (err) console.log(err);
                        //send error message
                        res.end();
                      });
                }
            })
        })
        .get(isAuthenticated, function(req, res) {

            User.paginate({}, req.query.page, req.query.limit, function(err, pageCount, users, itemCount) {

                var sort = function (prop, arr) {
                    prop = prop.split('.');
                    var len = prop.length;

                    arr.sort(function (a, b) {
                        var i = 0;
                        while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
                        if (a < b) {
                            return -1;
                        } else if (a > b) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    return arr;
                };

                if (err) return next(err);

                res.format({
                  html: function() {
                        res.render('users', {
                            title: 'Current DJs',
                            users: users,
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
                        data: users
                    });
                  }
                });

            }, { sortBy : { 'local.name': 1 }});

        });

    router.route('/user/:id')
        .post(isAuthenticated, function(req,res){
            console.log('delete user');
            //if(req.user.permanent != true) {
                //delete user from db
                User.remove({
                    _id: req.params.id
                }, function(err, user) {
                    if (err) {
                        console.log('There was an error deleting this user: '+err)
                    } else {
                        res.redirect('back');
                    }
                });
            //}
        });

    router.route('/add-position/:id')
        .post(isAuthenticated, function(req,res){
            console.log('add user position');
            User.findOne({
                _id: req.params.id
            }, function(err, user) {
                if (err) {
                    console.log('There was an error finding this user: '+err)
                } else {

                    user.eboard.position = req.body.position;
                    user.save(function(err) {
                        if (err) {
                            console.log('There was an error updating the position: '+err)
                        }
                        res.redirect('back');
                    })
                }
            });
        });

    router.route('/remove-position/:id')
        .post(isAuthenticated, function(req,res){
            console.log('add user position');
            User.findOne({
                _id: req.params.id
            }, function(err, user) {
                if (err) {
                    console.log('There was an error finding this user: '+err)
                } else {

                    user.eboard = undefined;
                    user.save(function(err) {
                        if (err) {
                            console.log('There was an error updating the position: '+err)
                        }
                        res.redirect('back');
                    })
                }
            });
        });

    router.route('/events')
        .post(isAuthenticated, function(req, res){

            var newEvent = new Event();

            //get id from hidden field
            var id = req.body.id;
            console.log('Event: '+id);

            //get data from form inputs
            newEvent.name = req.body.name;
            newEvent.date = req.body.date;
            newEvent.location = req.body.location;
            newEvent.description = req.body.description;

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

            newEvent.spam = req.body.spam;

            ///if event is new (id is null), save it
            if(!id){

                newEvent.save(function(err, result){
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {
                        console.log('Event Added');
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
                                end_time: newEvent.end_time,
                                spam: newEvent.spam };
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
        .get(isAuthenticated, function(req, res){
            
            Event.find().sort({start_time: -1}).exec(function(err,events) {
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

    router.get('/sign_s3', function(req, res){
        aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: S3_BUCKET,
            Key: 'spam/'+req.query.event_id+path.extname(req.query.s3_object_name).toLowerCase(),
            Expires: 60,
            ContentType: req.query.s3_object_type,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3_params, function(err, data){
            if(err){
                console.log(err);
            }
            else{
                console.log(req.query.event_id+path.extname(req.query.s3_object_name).toLowerCase());
                var return_data = {
                    signed_request: data,
                    url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/spam/'+req.query.event_id+path.extname(req.query.s3_object_name).toLowerCase()
                };
                res.write(JSON.stringify(return_data));
                res.end();
            }
        });
    });

    //for deleting an event
    router.route('/events/:id')
        .post(isAuthenticated, function(req, res){
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
        .post(isAuthenticated, function(req, res){

            var position = req.user.eboard.position;

            var query = {'local.username': req.user.local.username};
            var update = {  'eboard.year': req.body.year,
                            'eboard.animal': req.body.animal,
                            'eboard.bands': req.body.bands,
                            'eboard.concert': req.body.concert,
                            'eboard.thoughts': req.body.thoughts,
                            'eboard.interview': req.body.interview
                            };

            for (var i in update) {
              if (update[i] === null || update[i] === undefined) {
                delete update[i];
              }
            }

            User.findOneAndUpdate(query, update, function(err, user) {
                if (err) {
                    console.log('error updating eboarder: '+err);
                } else {
                    console.log('updated eboarder: '+user);
                }
                res.redirect('back');
            });

        })
        .get(isAuthenticated, function(req, res){

            console.log(req.user);

            res.render('eboard', {
                title: 'Eboard Profile',
                user : req.user // get the user out of session and pass to template
            });

        });

    router.route('/stream')
        .post(isAuthenticated, function(req, res){

            res.redirect('back');

        })
        .get(isAuthenticated, function(req, res){

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
        .post(isAuthenticated, function(req, res){

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
        .get(isAuthenticated, function(req, res){

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
        .get(isAuthenticated, function(req, res){

            User.find(function(err,users){
                if(err) {
                    console.log("there was an error fetching users");
                } else {
                    res.render('scheduler', {
                        title: 'Scheduler',
                        users: users,
                        user: req.user // get the user out of session and pass to template
                    });
                }
            });

        });

    router.route('/add-schedule')
        .post(isAuthenticated, function(req, res){

            var user = req.body.data.username;

            var query = {"local.username": user};
            var update = {showTime: 
                            {y: req.body.data.y, 
                             x: req.body.data.x }
                         };
            User.findOne(query, function(err, user) {

                if (err) {
                    console.log('error finding user: '+err);
                }

                user.show.push(update);

                user.save(function(err,result){
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {
                        console.log('User show added');
                        console.log(result);
                    }
                    res.end();
                });

            });

        });

    router.route('/delete-schedule')
        .post(isAuthenticated, function(req, res){

            var user = req.body.data.username;

            var query = {"local.username": user};
            var update = {showTime: 
                            {y: req.body.data.y, 
                             x: req.body.data.x }
                         };

            User.findOne(query, function(err, user) {

                if (err) {
                    console.log('error finding user: '+err);
                }

                //loop through all possible shows
                for (var i = user.show.length - 1; i >= 0; i--) {
                    //if the day is right, find the hour to delete it
                    if(req.body.data.y == user.show[i].showTime.y) {
                        for (var n = user.show[i].showTime.x.length - 1; n >= 0; n--) {
                            user.show[i].showTime.x[n] = parseInt(user.show[i].showTime.x[n]);
                            //if the x's match
                            if(req.body.data.x == user.show[i].showTime.x[n]) {
                                //if that's the only entry, delete it
                                if(user.show[i].showTime.x.length == 1) {
                                    user.show.splice(i, 1);
                                }
                                //if it's in the middle of the array, split into two shows
                                else if (user.show[i].showTime.x.indexOf(req.body.data.x)>0 && user.show[i].showTime.x.indexOf(req.body.data.x)>user.show[i].showTime.x.length) {
                                    console.log("in the middle need to fix")
                                }
                                //otherwise just delete it
                                else {
                                    user.show[i].showTime.x.splice(n,1);
                                }
                            }
                        }
                    }
                };

                user.save(function(err,result){
                    if(err) {
                        console.log("This is an error: "+err);
                    } else {
                        console.log('User show deleted');
                        console.log(result);
                    }
                    res.end();
                });

            });

        });

    router.route('/clear-schedule')
        .post(isAuthenticated, function(req, res){

            User.find(function(err, users) {

                users.forEach(function(user) {

                    user.show = [];

                    //save the user
                    user.save(function (err) {
                        if(err) {
                            console.log('error updating user'+user.local.username+': '+err);
                        }
                    });
                });

                res.end();

            });

        });

    router.route('/manage')
        .post(isAuthenticated, function(req, res){



        })
        .get(isAuthenticated, function(req, res){
            res.render('manage', {
                title: 'Manage',
                user: req.user // get the user out of session and pass to template
            });

        });

    return router;
}
