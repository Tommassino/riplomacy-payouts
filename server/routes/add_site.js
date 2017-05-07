// add_site.js

var models = require('../models');

module.exports = function(router) {
	router.get('/add_site/:id', (req, res) => {
		models.Op.findById(req.params.id, {
			include: [models.Site]
		}).then(op => {
			models.Site.create().then(site => {
				site.setOp(op).then(function() {
					res.send(op);
				});
			})
		});
	});
}