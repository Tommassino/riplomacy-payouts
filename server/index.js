/*const express = require('express');
const bodyParser = require('body-parser');
const Io = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = Io(server);

const port = process.env.PORT || 3000; // TODO add  to config

//enable CORS in express development
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//enable CORS in socket io
io.origins('*:*');

//testing stuff
app.get('/', function(req, res,next) {  
	console.log(__dirname);
    res.sendFile(path.resolve(__dirname + '/../client/index.html'));
});

//load DB model and sync with database
const models = require('./models');
models.sequelize.sync();

//hook up classic express stuff via router hooks
app.use('/',require('./routes'));

//hook up socket io stuff
require('./sockets')(io);

server.listen(port);
*/

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//enable CORS in socket io
io.origins('*:*');

//hook up socket io stuff
require('./sockets')(io);

//enable CORS in express development
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//hook up classic express stuff via router hooks
app.use('/',require('./routes'));

//load DB model and sync with database
const models = require('./models');
models.sequelize.sync();

server.listen(3000);

//whatever
