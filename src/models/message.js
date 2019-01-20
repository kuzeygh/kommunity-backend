import Sequelize, { type DataTypes } from 'sequelize';

module.exports = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const Message = sequelize.define('Message', {
    channelUuid: {
      type: dataTypes.UUID,
      allowNull: false,
      field: 'channel_uuid',
      validate: {
        isUUID: 4,
      },
    },
    senderUuid: {
      type: dataTypes.UUID,
      allowNull: false,
      field: 'sender_uuid',
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
    text: {
      type: dataTypes.TEXT('long'),
      allowNull: false,
      field: 'text',
    },
    createdAt: {
      type: dataTypes.DATE,
      field: 'created_at',
      validate: {
        isDate: true,
      },
    },
  }, {
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'messages',
  });
  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      as: 'sender',
    });
    Message.belongsTo(models.Channel, {
      as: 'channel',
    });
  };

  return Message;
};
