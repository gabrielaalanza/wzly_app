// routes/routes.js
var express = require('express');
var router = express.Router();

var Song = require('../models/song');

module.exports = function(){
/*
  router.get('/log-automated/:data', function(req, res) {
    console.log(req.params);
    res.end();
  });

  router.post('/log-automated/:data', function(req, res) {
    console.log(req.params);
    res.end();
  });
*/

  router.route('/log-automated/:nowplaying/:album')
    .post(function(req, res){
        
        //save the song
        var song = new Song();
        
        var song_data = req.params.nowplaying;
        song_data = song_data.split(" - ");
        song.name = song_data[1];
        song.artist = song_data[0];
        song.album = req.params.album;
        song.playedBy = "Robo DJ"

        console.log(song);

        Song.nextCount(function(err, count) {

            song.save(function(err, result){
                if(err) {
                    console.log("There was an error adding this song: "+err);
                } else {
                    console.log('Song added from robo dj');
                }
            });
        });

  }).get(function(req, res){

        res.end();
    });


return router;
}