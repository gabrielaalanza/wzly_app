// app/models/schedule.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var scheduleSchema = mongoose.Schema({

    schedule         : [],
    name             : { type: String, default: "schedule" }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Schedule', scheduleSchema);