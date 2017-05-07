// add_pilot.js

var models = require('../models');

module.exports = function(router) {
	router.get('/add_pilot/:name', (req, res) => {
		models.Pilot.findOrCreate({
			where: {
				pilotName: req.params.name
			}
		}).then(pilot => {
			res.send(pilot)
		});
	});
}