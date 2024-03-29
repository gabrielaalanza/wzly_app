// app/models/song.js
// load the things we need
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var mongoosePaginate = require('mongoose-paginate');

// define the schema for our user model
var songSchema = mongoose.Schema({

    name             : String,
    artist           : String,
    album            : String,
    id               : Number,
    date             : { type: Date, default: Date.now },
    playedBy         : String

});

// methods ======================
songSchema.plugin(autoIncrement.plugin, { model: 'Song', field: 'id', startAt: 1 });
songSchema.plugin(mongoosePaginate);

// create the model for users and expose it to our app
module.exports = mongoose.model('Song', songSchema);