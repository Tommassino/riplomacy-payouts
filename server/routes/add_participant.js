// add_participant.js

var models = require('../models');

module.exports = function(router) {
	router.post('/add_participant', (req, res) => {
		var data = req.body;
		console.log(data);

		models.SiteParticipation.findOrCreate({
			where: {
				SiteId: data.siteId,
				PilotId: data.pilotId
			},
			defaults: {
				SiteId: data.siteId,
				PilotId: data.pilotId
			}
		}).then(siteParticipation => {
			console.log(siteParticipation[0]);
			siteParticipation[0].update({
				points: data.points
			}).then(function() {
				res.send(siteParticipation);
			})
		})
	});
}