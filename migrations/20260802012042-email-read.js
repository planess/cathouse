module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('email_read', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['messageId', 'userId', 'createdAt', 'updatedAt'],
          properties: {
            messageId: {
              bsonType: 'objectId',
              description: 'ID of the message from email_messages',
            },
            userId: {
              bsonType: 'objectId',
              description: 'ID of the user viewing the message',
            },
            firstReadAt: {
              bsonType: 'date',
              description: 'Date of first message opening',
            },
            lastReadAt: {
              bsonType: 'date',
              description: 'Date of last message opening',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of record creation',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Date of record update',
            },
          },
        },
      },
    });

    await db
      .collection('email_read')
      .createIndex({ messageId: 1, userId: 1 }, { unique: true });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.dropCollection('email_read');
  },
};
