module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Create the encryption collection with validation
    await db.createCollection('encryption', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['algorithm', 'publicKey', 'privateKey', 'createdAt', 'createdBy'],
          properties: {
            algorithm: { bsonType: 'string' },
            publicKey: { bsonType: 'string' },
            privateKey: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            createdBy: { bsonType: 'objectId' },
          },
        },
      },
    });

    await db.collection('encryption').createIndex({ createdAt: 1 });

    console.log('Encryption collection created with validation');
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('encryption').drop();
  },
};
