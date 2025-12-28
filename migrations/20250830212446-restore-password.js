module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('users-restore-passwords', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userID', 'code', 'createdAt'],
          properties: {
            userID: {
              bsonType: 'objectId',
              description: 'ID of the user requesting password restoration',
            },
            code: {
              bsonType: 'string',
              description: 'Unique code for password restoration',
            },
            createdAt: { bsonType: 'date' },
          },
        },
      },
    });

    await db
      .collection('users-restore-passwords')
      .createIndex({ email: 1 }, { unique: true });
    await db
      .collection('users-restore-passwords')
      .createIndex({ code: 1 }, { unique: true });
    await db
      .collection('users-restore-passwords')
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('users-restore-passwords').drop();
  },
};
