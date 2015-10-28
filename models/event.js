// app/models/event.js
// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// define the schema for our user model
var eventSchema = new Schema({

    name             : String,
    location         : String,
    start_time       : String,
    end_time         : String,
    description      : String,
    spam             : String

});

// methods ======================

// create the model for events and expose it to our app
module.exports = mongoose.model('Event', eventSchema);