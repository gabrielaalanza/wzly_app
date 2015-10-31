// routes/api.js
var express = require('express');
var router = express.Router();

var Event = require('../models/event');
var Album = require('../models/album');
var Chart = require('../models/chart');
var User = require('../models/user');
var Song = require('../models/song');

function sortUsers(users, _callback){
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
  _callback();    
}

module.exports = function(){

  router.get('/events', function(req, res) {
    Event.find().sort({start_time: -1}).exec(function(err,events) {
       if(err) {
            console.log("there was an error loading events");
        } else {
            res.send({
                events : events
            });
        }
    });
  });

  router.get('/albums', function(req, res) {
    Album.find().sort({hrID: -1}).exec(function(err,albums) {
       if(err) {
            console.log("there was an error loading albums");
        } else {
            res.send({
                albums : albums
            });
        }
    });
  });

  router.get('/charts', function(req, res) {
    Chart.find().sort({count: -1}).exec(function(err,charts) {
       if(err) {
            console.log("there was an error loading charts");
        } else {
            res.send({
                charts : charts
            });
        }
    });
  });

  router.get('/users-schedule', function(req, res) {
    User.find(function(err,users) {
       if(err) {
            console.log("there was an error loading users");
        } else {

          function sendUsers(users){
            sortUsers(users, function() {
              res.send({ users : users });
            });    
          }

        }
    });
  });

  router.get('/songs', function(req, res) {
    Song.find(function(err,songs) {
       if(err) {
            console.log("there was an error loading songs");
        } else {
            res.send({
                songs : songs
            });
        }
    });
  });

return router;
}