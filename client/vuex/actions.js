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

export const actions = () => {
	var sockets = [
		'join_room',
		'add_op',
		'get_ops',
		'get_op',
		'update_op',
		'delete_op',
		'add_site',
		'delete_site',
		'get_sites',
		'update_site',
		'add_participant',
		'update_participant',
		'delete_participant'
	];
	return ((sockets) => {
		var action_handles = {}
		for (var idx in sockets) {
			var socket = sockets[idx];
			((action_handles, socket) => {
				var camelCased = ('socket_'+socket).replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
				action_handles[camelCased] = (context, data) => {
					console.log('sending ' + socket)
					console.log(data.params);
					data.socket.emit(socket, data.params);
				};
			})(action_handles, socket);
		}
		return action_handles;
	})(sockets);
}