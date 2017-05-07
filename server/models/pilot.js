"use strict";

module.exports = function(sequelize, DataTypes) {
	var Pilot = sequelize.define("Pilot", {
		pilotName: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});

	return Pilot;
};