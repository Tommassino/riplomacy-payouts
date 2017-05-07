//dummy
const models = require('../models');
const Serializer = require('sequelize-to-json');
var io = undefined;

const siteDetail_broadcast = (siteId) => {
	console.log('brodcasting site' + siteId);
	models.Site.findById(siteId, {
		include: [{
			model: models.SiteParticipation,
			include: models.Pilot
		}]
	}).then(function(site) {
		io.to(site.opId).emit('get_site', site);
	});
};

const participantAdded_broadcast = (siteParticipationId) => {
	console.log('brodcasting participant_added ' + siteParticipationId);
	models.SiteParticipation.findById(siteParticipationId, {
		include: [models.Pilot, models.Site]
	}).then(function(sp) {
		io.to(sp.Site.OpId).emit('participant_added', sp);
	});
};

const participantUpdated_broadcast = (siteParticipationId) => {
	console.log('brodcasting participant_update ' + siteParticipationId);
	models.SiteParticipation.findById(siteParticipationId, {
		include: [models.Pilot, models.Site]
	}).then(function(sp) {
		io.to(sp.Site.OpId).emit('participant_update', sp);
	});
};

const sendSites = (client, data) => {
	opId = data.opId;
	models.Site.findAll({
		where: {
			OpId: opId
		},
		include: [{
			model: models.SiteParticipation,
			include: models.Pilot
		}]
	}).then(function(sites) {
		client.emit('get_sites', sites);
	});
};

//TODO clone participation from last
const addSite = (client, data) => {
	opId = data.opId;
	models.Op.findById(opId, {
		include: [models.Site]
	}).then(op => {
		models.Site.create().then(site => {
			site.setOp(op).then(function() {
				console.log("broadcasting get_site to " + op.id);
				io.to(op.id).emit('get_site', site); //manual broadcast
			});
		})
	});
}

const addParticipant = (client, data) => {
	models.SiteParticipation.findOrCreate({
		where: {
			SiteId: data.siteId,
			PilotId: 1
		},
		defaults: {
			SiteId: data.siteId,
			PilotId: 1,
			Points: 0
		},
		raw: true
	}).then(siteParticipation => {
		participantAdded_broadcast(siteParticipation[0].id);
	});
};

const updateSite = (client, data) => {
	models.Site.update(data, {
			where: {
				id: data.id
			}
		})
		.then(function(result) {
			if (result[0] > 0)
				siteDetail_broadcast(data.id);
		});
};

const updateParticipant = (client, data) => {
	models.SiteParticipation.update({
			PilotId: data.pilotId,
			points: data.points
		}, {
			where: {
				id: data.id
			}
		})
		.then(function(result) {
			if (result[0] > 0)
				participantUpdated_broadcast(data.id);
		});
};


module.exports = (_io) => {
	io = _io;

	events = {
		'get_sites': sendSites,
		'update_site': updateSite,
		'add_site': addSite,
		'add_participant': addParticipant,
		'update_participant': updateParticipant
	};

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