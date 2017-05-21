//dummy
const models = require('../models');
const Serializer = require('sequelize-to-json');
var io = undefined;

const sendOpDetail = (client, data) => {
	opId = data.id
	models.Op.findById(opId, {
		include: [{
			model: models.Pilot,
			as: 'FleetCommander'
		}]
	}).then(function(op) {
		client.emit('get_op', op);
	});
};

const broadcastOpDetail = (opId) => {
	console.log('brodcasting ' + opId);
	models.Op.findById(opId, {
		include: [{
			model: models.Pilot,
			as: 'FleetCommander'
		}]
	}).then(function(op) {
		io.to(opId).emit('get_op', op);
	});
};

const updateOpDetail = (client, data) => {
	if (!data.id)
		return;
	models.Op.update(data, {
			where: {
				id: data.id
			}
		})
		.then(function(result) {
			if (result[0] > 0)
				broadcastOpDetail(data.id);
		});
};

const deleteOp = (client, data) => {
	models.Op.findById(data.opId).then(function(op) {
		op.destroy();
	});
};

const sendOpList = (client, data) => {
	models.Op.findAll({
		include: [{
			model: models.Pilot,
			as: 'FleetCommander'
		}]
	}).then(function(ops) {
		client.emit('get_ops', ops);
	});
};

const addOp = (client, data) => {
	models.Op.create().then(op_shallow => {
		models.Op.findById(op_shallow.id).then(op => {
			console.log("broadcasting op_added");
			io.sockets.emit('op_added', op); //manual broadcast
		});
	});
};

const joinRoom = (client, data) => {
	client.join(data.room);
};

module.exports = (_io) => {
	io = _io;

	events = {
		'join_room': joinRoom,
		'get_ops': sendOpList,
		'add_op': addOp,
		'get_op': sendOpDetail,
		'update_op': updateOpDetail,
		'delete_op': deleteOp
	}

	io.on('connection', (function(events) {
		return function(client) {

			for (var event in events) {
				console.log(event);
				client.on(event, (function(handle) {
					return function(data) {
						console.log("recieved " + handle + " with data: " + JSON.stringify(data));
						events[handle](client, data);
					}
				})(event));
			}
		}
	})(events));
}