// app/models/chart.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var chartSchema = mongoose.Schema({

    date             : { type: Date, default: Date.now },
    list             : [{
      artist           : String,
      album            : String,
      count            : {
          type         : String,
          default      : 0
      }
    }]

});

// methods ======================

// create the model for users and expose it to our app
module.exports = mongoose.model('Chart', chartSchema);