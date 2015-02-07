// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// define the schema for our user model
var eboarderSchema = new Schema({

    position         : String,
    name             : String,
    year             : String,
    show             : String,
    time             : String,
    animal           : String,
    bands            : String,
    concert          : String,
    thoughts         : String,
    interview        : String,
    picture          : String

});

// methods ======================

// create the model for users and expose it to our app
module.exports = mongoose.model('Eboarder', eboarderSchema);