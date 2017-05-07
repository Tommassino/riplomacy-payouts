// get_op.js

var models = require('../models');

module.exports = function(router) {
	router.get('/get_op/:id', (req, res) => {
		models.Op.findById(req.params.id,{
			include: [models.Site]
		}).then(function(ops) {
			res.send(ops);
		});
	});
}