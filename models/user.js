// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = new Schema({

    local            : {
        username     : String,
        email        : String,
        name         : String,
        password     : String,
        resetPasswordToken: String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    show             : [{
        showName     : String,
        showTime     : {
            y        : Number,
            x        : Array
        }
    }],
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
    live             : {type: Boolean, default: false },
    permanent        : {type: Boolean, default: false },
    eboard           : {
        position         : String,
        year             : String,
        animal           : String,
        bands            : String,
        concert          : String,
        thoughts         : String,
        interview        : String
    }

});

// methods ======================
userSchema.plugin(mongoosePaginate);

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('local.password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.local.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.local.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.local.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);