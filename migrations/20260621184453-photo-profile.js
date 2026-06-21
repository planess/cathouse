module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // append validation for column 'profilePhoto' to the 'profiles' collection
    await db.command({
      collMod: 'profiles',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          properties: {
            firstName: {
              bsonType: 'string',
            },
            lastName: {
              bsonType: 'string',
            },
            sex: {
              bsonType: 'string',
              enum: ['male', 'female'],
            },
            profilePhoto: {
              bsonType: 'string',
              description: "'profilePhoto' must be a string and is required",
            },
          },
        },
      },
      validationLevel: 'moderate',
    });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // remove the 'profilePhoto' field from all documents in the 'profiles' collection
    await db
      .collection('profiles')
      .updateMany({}, { $unset: { profilePhoto: '' } });

    // remove validation for column 'profilePhoto' from the 'profiles' collection
    await db.command({
      collMod: 'profiles',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          properties: {
            firstName: {
              bsonType: 'string',
            },
            lastName: {
              bsonType: 'string',
            },
            sex: {
              bsonType: 'string',
              enum: ['male', 'female'],
            },
          },
        },
      },
      validationLevel: 'off',
    });
  },
};
