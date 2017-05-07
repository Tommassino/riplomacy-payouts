"use strict";
const Serializer = require('sequelize-to-json');

module.exports = function(sequelize, DataTypes) {
  var SiteParticipation = sequelize.define("SiteParticipation", {
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate: function(models) {
        SiteParticipation.belongsTo(models.Site, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
        SiteParticipation.belongsTo(models.Pilot, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

  return SiteParticipation;
};