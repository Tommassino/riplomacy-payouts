"use strict";

module.exports = function(sequelize, DataTypes) {
  var Site = sequelize.define("Site", {
    estimatedPayout: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate: function(models) {
        Site.belongsTo(models.Op, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });

        Site.hasMany(models.SiteParticipation);
      }
    }
  });

  return Site;
};