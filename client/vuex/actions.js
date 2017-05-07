const cleanJson = function(json) {
	for (var id in json) {
		if (json.hasOwnProperty(id)) {
			for (var attr in json[id]) {
				if (json[id].hasOwnProperty(attr) && attr.indexOf('within_') === 0) {
					console.log('Deleting postalcodes.' + id + '.' + attr);
					delete json[id][attr];
				}
			}
		}
	}
}

export const actions = {
	SEND_GET_SITES: (context, data) => {
		console.log('sending get_site')
		console.log(data.params);
		data.socket.emit('get_sites', data.params);
	},
	SEND_JOIN_ROOM: (context, data) => {
		console.log('sending join_room')
		console.log(data.params);
		data.socket.emit('join_room', data.params);
	},
	SEND_GET_OP: (context, data) => {
		console.log('sending get_op')
		console.log(data.params);
		data.socket.emit('get_op', data.params);
	},
	SEND_GET_OPS: (context, data) => {
		console.log('sending get_ops')
		console.log(data.params);
		data.socket.emit('get_ops', data.params);
	},
	SEND_UPDATE_OP: (context, data) => {
		console.log('sending update_op')
		cleanJson(data.params.opData);
		console.log(JSON.stringify(data.params));
		data.socket.emit('update_op', data.params);
	},
	SEND_ADD_SITE: (context, data) => {
		console.log('sending add_site')
		console.log(data.params);
		data.socket.emit('add_site', data.params);
	},
	SEND_ADD_PARTICIPANT: (context, data) => {
		console.log('sending add_participant')
		console.log(data.params);
		data.socket.emit('add_participant', data.params);
	},
	SEND_UPDATE_PARTICIPANT: (context, data) => {
		console.log('sending update_participant')
		console.log(data.params);
		data.socket.emit('update_participant', data.params);
	},
	SEND_DELETE_OP: (context, data) => {
		console.log('sending delete_op')
		console.log(data.params);
		data.socket.emit('delete_op', data.params);
	},
	SEND_UPDATE_SITE: (context, data) =>{
		console.log('sending update_site')
		console.log(data.params);
		data.socket.emit('update_site', data.params);
	}
}