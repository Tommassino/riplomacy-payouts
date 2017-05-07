// get_ops.js

var models = require('../models');

module.exports = function(router) {
	router.get('/get_ops', (req, res) => {
		models.Op.findAll({
			include: [{
				model: models.Site,
				include: models.SiteParticipation
			}]
		}).then(function(ops) {
			res.send(ops);
		});
	});
}