var path = require('path');
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');

// 27017 is the default port for connecting to MongoDB
if(!process.env.PORT) {
  mongoose.connect('mongodb://localhost/test');
}
else{
  mongoose.connect('mongodb://MongoLabs:TIu7B1MQtbLG59N0nEG3oJFcefgfyEBA9ZX4lzb5vyo-@ds040898.mongolab.com:40898/MongoLabs');
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
  var urlsSchema = mongoose.Schema({
    url: String,
    base_url: String,
    code: String,
    title: String,
    visits: Number
  });

  var usersSchema = mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
  });

  urlsSchema.pre('save', function(next) {
    var shasum = crypto.createHash('sha1');
    shasum.update(this.url);
    this.code = shasum.digest('hex').slice(0, 5);
    next();
  });

  usersSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    var cipher = Promise.promisify(bcrypt.hash);
    cipher(user.password, null, null).bind(this)
    .then(function(hash) {
      user.password = hash;
      next();
    });
  });

  usersSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
      callback(isMatch);
    });
  };

  db.Link = mongoose.model('Link', urlsSchema);
  db.User = mongoose.model('User', usersSchema);
  console.log('models initialized');
  module.exports = db;
});

