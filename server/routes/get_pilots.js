// get_pilots.js

var models = require('../models');

module.exports = function(router) {
	router.get('/get_pilots', (req, res) => {
		console.log('recieved get pilots');
		var filter = {
			where: {}
		};
		if (req.query.pilotName) {
			filter = {
				where: ['pilotName LIKE ?', req.query.pilotName + '%']
			}
		}
		models.Pilot.findAll(filter).then(function(pilots) {
			res.json(pilots);
		});
	});
}