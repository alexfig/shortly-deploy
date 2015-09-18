var app = require('./server-config.js');

var port = process.env.PORT || 3000;

//var ip = process.env.IP || '127.0.0.1';
app.listen(port);

console.log('Server now listening on port ' + port);
