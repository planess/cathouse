module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // add new field validations of schema
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
            alias: {
              bsonType: 'string',
            },
            sex: {
              bsonType: 'string',
              enum: ['male', 'female'],
            },
            about: {
              bsonType: 'string',
            },
            profilePhoto: {
              bsonType: 'string',
              description: "'profilePhoto' must be a string and is required",
            },
            badgeValidUntil: {
              bsonType: 'date',
            },
            hiredOn: {
              bsonType: 'date',
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
    // revert back the former schema validation
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
};
