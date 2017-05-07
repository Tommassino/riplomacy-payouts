// add_op.js

var models = require('../models');

module.exports = function(router) {
	router.get('/add_op/:name', (req, res) => {
		models.Pilot.findOrCreate({
			where: {
				pilotName: req.params.name
			}
		}).then(pilot => {
			models.Op.create({
				status: 0,
				actualPayout: 0
			}).then(op => {
				op.setFleetCommander(pilot[0]).then(function() {
					res.send(op);
				});
			})
		});
	});
}