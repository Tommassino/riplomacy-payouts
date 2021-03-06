//dummy
const models = require('../models');
const Serializer = require('sequelize-to-json');
var io = undefined;

const siteDetail_broadcast = (siteId) => {
	console.log('brodcasting get_site ' + siteId);
	models.Site.findById(siteId, {
		include: [{
			model: models.SiteParticipation,
			include: models.Pilot
		}]
	}).then(function(site) {
		io.to(site.OpId).emit('get_site', site);
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

const addSite = (client, data) => {
	opId = data.opId;

	models.sequelize.transaction({
		autocommit: false
	}).then(transaction => {
		return models.Op.findById(opId, {
			transaction
		}).then(op => {
			return models.Site.find({
				include: [models.SiteParticipation],
				where: {
					OpId: opId
				},
				order: [
					['createdAt', 'DESC']
				],
				transaction
			}).then(latest_site => {
				return models.Site.create({
					OpId: op.id
				}, {
					transaction
				}).then(site => {
					return models.sequelize.Promise.map(latest_site ? latest_site.SiteParticipations : [], participation => {
						var clean = {};
						Object.assign(clean,participation.dataValues);
						delete clean.createdAt;
						delete clean.updatedAt;
						delete clean.id;
						clean.SiteId = site.id
						console.log(clean);

						return models.SiteParticipation.create(clean, {
							transaction
						});
					}).then(participations => {
						return models.Site.findById(site.id, {
							include: [{
								model: models.SiteParticipation,
								include: models.Pilot
							}],
							transaction
						}).then(function(new_site) {
							io.to(new_site.OpId).emit('get_site', new_site);
							return transaction.commit();
						}).catch(err => {
							console.log(err);
							return transaction.rollback();
						});
					});
				});
			});
		})
	});
}

const addParticipant = (client, data) => {
	models.SiteParticipation.findOrCreate({
		where: {
			PilotId: undefined,
			SiteId: data.siteId
		},
		defaults: {
			SiteId: data.siteId,
			Points: 1
		},
		raw: true
	}).then(siteParticipation => {
		participantAdded_broadcast(siteParticipation[0].id);
	});
};

const updateSite = (client, data) => {
	//TODO protect certain fields from rewrite?

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
	var clean = {}
	Object.assign(clean, data)
	delete clean.id;
	delete clean.Pilot;
	delete clean.Site;
	delete clean.createdAt;

	models.SiteParticipation.update(clean, {
			where: {
				id: data.id
			}
		})
		.then(function(result) {
			if (result[0] > 0)
				participantUpdated_broadcast(data.id);
		});
};

const deleteSite = (client, data) => {
	models.Site.findById(data.siteId).then(function(site) {
		site.destroy();
		io.to(site.OpId).emit('site_deleted', data);
	});
};

const deleteParticipant = (client, data) => {
	models.SiteParticipation.findById(data.id).then(function(siteParticipation) {
		var siteId = siteParticipation.SiteId;
		siteParticipation.destroy();
		models.Site.findById(siteId).then(function(site) {
			io.to(site.OpId).emit('participant_deleted', data);
		});
	});
};


module.exports = (_io) => {
	io = _io;

	events = {
		'get_sites': sendSites,
		'update_site': updateSite,
		'add_site': addSite,
		'add_participant': addParticipant,
		'update_participant': updateParticipant,
		'delete_participant': deleteParticipant,
		'delete_site': deleteSite
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