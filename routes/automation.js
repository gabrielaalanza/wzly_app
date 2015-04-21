// routes/routes.js
var express = require('express');
var router = express.Router();

var Song = require('../models/song');

module.exports = function(){

  router.post('/log-automated/:data', function(req, res){

    console.log(req);
    
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

return router;
}