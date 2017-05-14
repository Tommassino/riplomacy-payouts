//config
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/config/config.json')[env];

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
	path: config.bind_path
});

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
app.use('/', require('./routes'));

//load DB model and sync with database
const models = require('./models');
models.sequelize.sync();

server.listen(config.bind_port);

//whatever