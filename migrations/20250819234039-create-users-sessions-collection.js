/* eslint-disable no-console */
module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Create users collection with schema validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'createdAt', 'isActive'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            },
            emailVerified: { bsonType: 'bool' },
            password: { bsonType: 'string', description: 'Hashed password' },
            roles: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
              description: 'List of role IDs',
            },
            isActive: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Create collection with profile information
    await db.createCollection('profiles', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userID'],
          properties: {
            userID: { bsonType: 'objectId' },
            firstName: { bsonType: 'string' },
            lastName: { bsonType: 'string' },
            sex: { bsonType: 'string', enum: ['male', 'female'] },
          },
        },
      },
    });

    // Create collection for sessions
    await db.createCollection('sessions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userID', 'token', 'createdAt'],
          properties: {
            userID: { bsonType: 'objectId' },
            token: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
          },
        },
      },
    });

    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ isActive: 1 });
    await db.collection('users').createIndex({ createdAt: 1 });

    await db
      .collection('profiles')
      .createIndex({ userID: 1 }, { unique: true });

    await db
      .collection('sessions')
      .createIndex({ userID: 1 });
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });

    // insert first admin user
    const userRecord = await db.collection('users').insertOne({
      email: 'admin@perilines.com.ua',
      emailVerified: true,
      password: 'hashed_password_should_be_restored',
      roles: [],
      isActive: true,
      createdAt: new Date(),
    });
    await db.collection('profiles').insertOne({
      userID: userRecord.insertedId,
    });

    console.info(
      'Users and profiles collection created with schema validation and indexes',
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Rollback: drop the users collection
    await db.collection('users').drop();
    await db.collection('profiles').drop();
    await db.collection('sessions').drop();

    console.info('Users and profiles collections dropped');
  },
};
