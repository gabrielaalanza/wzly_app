// routes/api.js
var express = require('express');
var router = express.Router();

var Event = require('../models/event');

module.exports = function(){

  router.get('/events', function(req, res) {
    Event.find().sort({start_time: -1}).exec(function(err,events) {
       if(err) {
            console.log("there was an error loading events");
        } else {
            res.send({
                moment: moment,
                events : events
            });
        }
    });
  });

return router;
}