// routes/api.js
var express = require('express');
var router = express.Router();

var Event = require('../models/event');
var Album = require('../models/album');
var Chart = require('../models/chart');
var User = require('../models/user');
var Song = require('../models/song');

module.exports = function(){

  router.get('/events', function(req, res) {
    Event.find().sort({start_time: -1}).exec(function(err,events) {
       if(err) {
            console.log("there was an error loading events");
        } else {
            res.send({events});
        }
    });
  });

  router.get('/albums', function(req, res) {
    Album.find().sort({hrID: -1}).exec(function(err,albums) {
       if(err) {
            console.log("there was an error loading albums");
        } else {
            res.send({albums});
        }
    });
  });

  router.get('/charts', function(req, res) {
    Chart.find().sort({count: -1}).exec(function(err,charts) {
       if(err) {
            console.log("there was an error loading charts");
        } else {
            res.send({charts});
        }
    });
  });

  router.get('/users-schedule', function(req, res) {
    User.find(function(err,users) {
       if(err) {
            console.log("there was an error loading users");
        } else {

          /*
          for (var i = users.length - 1; i >= 0; i--) {
            delete users[i].local.password;
            delete users[i].local.resetPasswordToken;
            delete users[i].facebook;
            delete users[i].picture;
            delete users[i].bio;
            delete users[i].bands;
            delete users[i].playlists;
            delete users[i].permanent;
          };
          */

          res.send({users});

        }
    });
  });
/*
  router.get('/songs', function(req, res) {
    Song.find().sort({id: -1}).exec(function(err,songs) {
       if(err) {
            console.log("there was an error loading songs");
        } else {
            res.send({songs});
        }
    });
  });
*/
  router.get('/songs', function(req, res) {

    var startIndex = req.query.start;
    var endIndex = req.query.end;
    var arr = [];

    for (var i = startIndex; i >= endIndex; i++) {
      arr.push(i);
    };

    Song.find({'id': { $in: arr }).sort({id: -1}).exec(function(err,songs) {
       if(err) {
            console.log("there was an error loading songs");
        } else {
            res.send({songs});
        }
    });
  });

  router.get('/profile', function(req, res) {

    var dj = req.query.user;

    console.log(dj);

    User.findOne({'local.username':dj}, function(err,user) {
       if(err) {
            console.log("there was an error loading this user");
        } else {
            res.send({user});
        }
    });
  });

return router;
}