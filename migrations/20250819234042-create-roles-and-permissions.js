/* eslint-disable no-console */
module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Create roles collection
    await db.createCollection('roles', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'name',
            'permissions',
            'isActive',
            'createdAt',
            'createdBy',
          ],
          properties: {
            name: { bsonType: 'string' },
            description: { bsonType: 'string' },
            permissions: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
              description: 'Array of permission IDs that this role has',
            },
            inherits: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
              description: 'Array of role IDs that this role inherits from',
            },
            isActive: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
            createdBy: { bsonType: 'objectId' },
          },
        },
      },
    });

    // Create permissions collection
    await db.createCollection('permissions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'name',
            'resource',
            'action',
            'isActive',
            'createdAt',
            'createdBy',
          ],
          properties: {
            name: { bsonType: 'string' },
            description: { bsonType: 'string' },
            resource: { bsonType: 'string' },
            action: { bsonType: 'string' },
            isActive: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
            createdBy: { bsonType: 'objectId' },
          },
        },
      },
    });

    // Create indexes
    await db.collection('roles').createIndex({ isActive: 1 });

    await db
      .collection('permissions')
      .createIndex({ resource: 1, action: 1 }, { unique: true });
    await db.collection('permissions').createIndex({ isActive: 1 });

    const userRecord = await db.collection('users').findOne({ email: 'admin@perilines.com.ua' });
    const userID = userRecord?._id;

    // Insert default roles and permissions
    const defaultPermissions = [
      {
        name: 'User Read',
        description: 'Read user information',
        resource: 'user',
        action: 'read',
        isActive: true,
        createdAt: new Date(),
        createdBy: userID,
      },
      {
        name: 'User Write',
        description: 'Create and update user information',
        resource: 'user',
        action: 'write',
        isActive: true,
        createdAt: new Date(),
        createdBy: userID,
      },
      {
        name: 'Admin All',
        description: 'Full administrative access',
        resource: 'admin',
        action: 'all',
        isActive: true,
        createdAt: new Date(),
        createdBy: userID,
      },
    ];

    const permissionResult = await db
      .collection('permissions')
      .insertMany(defaultPermissions);

    const roleUserResult = await db.collection('roles').insertOne({
      name: 'User',
      description: 'Standard user role',
      permissions: [permissionResult.insertedIds[0]],
      inherits: [],
      isActive: true,
      createdAt: new Date(),
      createdBy: userID,
    });
    const roleModeratorResult = await db.collection('roles').insertOne({
      name: 'Moderator',
      description:
        'Moderator role with user permissions plus moderation capabilities',
      permissions: [permissionResult.insertedIds[1]],
      inherits: [roleUserResult.insertedId],
      isActive: true,
      createdAt: new Date(),
      createdBy: userID,
    });
    const roleAdminResult = await db.collection('roles').insertOne({
      name: 'Admin',
      description: 'Administrator role with full access',
      permissions: [permissionResult.insertedIds[2]],
      inherits: [roleModeratorResult.insertedId],
      isActive: true,
      createdAt: new Date(),
      createdBy: userID,
    });

    // assign role for primary user
    await db.collection('users').updateOne(
      { email: 'admin@perilines.com.ua' },
      {
        $set: {
          roles: [roleAdminResult.insertedId],
        },
      },
    );

    console.info('Roles and permissions collections created with default data');
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Rollback: drop the collections
    await db.collection('roles').drop();
    await db.collection('permissions').drop();

    console.info('Roles and permissions collections dropped');
  },
};
