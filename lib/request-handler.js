var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  db.Link.find().exec(function(links) {
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
  db.Link.findOne({url:uri}).exec(function(err, url){
    if(url) {
      res.send(200, url);
    }else{
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = {
          url: uri,
          title: title,
          base_url: req.headers.origin
        };
        db.Link.create(newLink, function(err, link) {
          res.send(200, link);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

   db.User.findOne({username:username}).exec(function(err, user){
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.create({
      username: username,
      password: password
    }, 
    function(err, user) {
      if(err){
        console.log('Account already exists');
        res.redirect('/signup');
      }else{
        util.createSession(req, res, user);
      }
  });
};





exports.navToLink = function(req, res) {
  db.Link.findOne({code: req.params[0]}).exec(function(err, link){
    if (!link) {
      res.redirect('/login');
    } else {
      link.visits++;
      return res.redirect(link.url);

    }
  });
};

//   new Link({ code: req.params[0] }).fetch().then(function(link) {
//     if (!link) {
//       res.redirect('/');
//     } else {
//       link.set({ visits: link.get('visits') + 1 })
//         .save()
//         .then(function() {
//           return res.redirect(link.get('url'));
//         });
//     }
//   });
// };