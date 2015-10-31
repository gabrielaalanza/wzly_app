// app/models/album.js
// load the things we need
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var mongoosePaginate = require('mongoose-paginate');

// define the schema for our user model
var albumSchema = mongoose.Schema({

    artist           : String,
    album            : String,
    count            : {
        type         : Number,
        default      : 0
    },
    hrID             : Number

});

// methods ======================
albumSchema.plugin(mongoosePaginate);
albumSchema.plugin(autoIncrement.plugin, { model: 'Album', field: 'hrID', startAt: 1 });

// create the model for users and expose it to our app
module.exports = mongoose.model('Album', albumSchema);