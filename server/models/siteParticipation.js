"use strict";
const Serializer = require('sequelize-to-json');

module.exports = function(sequelize, DataTypes) {
  var SiteParticipation = sequelize.define("SiteParticipation", {
    fc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    db: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    scout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dps: {
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
          onDelete: "SET NULL"
        });
      }
    }
  });

  return SiteParticipation;
};