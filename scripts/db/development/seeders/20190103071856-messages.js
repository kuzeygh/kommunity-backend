import uuid from 'uuid';

const messages = [
  {
    channel_uuid: '23ea1110-d6a1-11e8-9f8b-f2801f1b9fd1',
    uuid: uuid(),
    sender_uuid: '3346776a-d69d-11e8-9f8b-f2801f1b9fd1',
    text: 'hello!',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    channel_uuid: '23ea1110-d6a1-11e8-9f8b-f2801f1b9fd1',
    uuid: uuid(),
    sender_uuid: '33467ba2-d69d-11e8-9f8b-f2801f1b9fd1',
    text: 'whats up',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('messages', messages, {});
  },
  down: () => {},
};
