var request = require("request");
var cheerio = require('cheerio');

module.exports = function (url) {

  return new Promise(function(resolve, reject){
    

  var image;
  console.log(url);
   request({
    uri: url
     }, function(error, response, body) {
      if(error){
        reject(error);
      }
      console.log(body.toString());
      var img;
      var rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/;
      //var rex =(["'])?(([^\.]*\.)*(jpe?|pn)g)\1[^>]*?>"

      var cheerio = require('cheerio'),
      $ = cheerio.load(body);
      var img = $('body').find('img');    
      
       // callback(img.attr('src'));
       resolve(img.attr('src'));

  });
 }
};