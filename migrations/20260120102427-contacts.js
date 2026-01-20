module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('connections', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'contacts', 'message', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the requester',
            },
            contacts: {
              bsonType: 'string',
              description: 'Contacts of the requester',
            },
            location: {
              bsonType: 'string',
              description: 'Location of the requester',
            },
            message: {
              bsonType: 'string',
              description: 'Message from the requester',
            },
            userAgent: {
              bsonType: 'string',
              description: 'User agent of the requester',
            },
            ip: {
              bsonType: 'string',
              description: 'IP address of the user'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            }
          }
        }
      }
    });
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
