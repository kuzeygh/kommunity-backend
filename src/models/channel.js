import Sequelize, { type DataTypes } from 'sequelize';

module.exports = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const Channel = sequelize.define('Channel', {
    communityUuid: {
      type: dataTypes.UUID,
      allowNull: false,
      field: 'community_uuid',
      validate: {
        isUUID: 4,
      },
    },
    uuid: {
      type: dataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      field: 'uuid',
      validate: {
        isUUID: 4,
      },
    },
    name: {
      type: dataTypes.STRING(30),
      allowNull: false,
      field: 'name',
      validate: {
        len: [1, 30],
      },
    },
    desc: {
      type: dataTypes.STRING(255),
      field: 'desc',
      validate: {
        len: [2, 255],
      },
    },
  }, {
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'channels',
  });

  Channel.associate = (models) => {
    Channel.hasMany(models.Message, {
      foreignKey: 'channelUuid',
    });
    Channel.belongsTo(models.Community, {
      as: 'community',
    });
  };

  return Channel;
};
