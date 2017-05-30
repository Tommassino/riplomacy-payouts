// add_pilot.js
var Esi = require('eve-swagger');

// Creating a new Api instance with a different configuration.
// All options, with their default values, are shown below.
var esi = Esi({
    service: 'https://esi.tech.ccp.is',
    source: 'tranquility',
    agent: 'eve-swagger | riplomacy-payouts',
    language: 'en-us',
    timeout: 6000,
    minTime: 0,
    maxConcurrent: 0
  });

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
	router.get('/add_pilot_eve/:id', (req, res) => {
		esi.characters.names(parseInt(req.params.id)).then(result => {
			models.Pilot.findOrCreate({
				where: {
					id: result[0].id,
					pilotName: result[0].name
				}
			}).then(pilot => {
				res.send(pilot)
			});
		});
	});
}