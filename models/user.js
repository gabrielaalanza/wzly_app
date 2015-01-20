// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = new Schema({

    local            : {
        username     : String,
        name         : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    showName         : String,
    showTime         : {
        startTime    : Number,
        endTime      : Number,
        dayOfWeek    : String
    },
    picture          : String,
    bio              : String,
    bands            : {
        band1        : String,
        band2        : String,
        band3        : String,
        band4        : String,
        band5        : String
    },
    playlists        : [{
        name         : String,
        description  : String,
        startIndex   : Number,
        endIndex     : Number,
        date         : { type: Date, default: Date.now }
    }],
    live             : {type: Boolean, default: false }

});

// methods ======================

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);