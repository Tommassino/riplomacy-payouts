"use strict";
const Serializer = require('sequelize-to-json');

module.exports = function(sequelize, DataTypes) {
  var Op = sequelize.define("Op", {
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    actualPayout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate: function(models) {
        Op.hasMany(models.Site);
        Op.belongsTo(models.Pilot, {
          as: 'FleetCommander',
          onDelete: 'SET NULL',
          constraints: false
        })
      }
    }
  });

  return Op;
};