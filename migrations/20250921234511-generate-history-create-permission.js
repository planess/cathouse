module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // find admin user
    const adminUser = await db
      .collection('users')
      .findOne({ email: 'admin@perilines.com.ua' });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // clean the collection
    await db.collection('permissions').deleteMany({});

    // clean permissions from roles
    await db.collection('roles').updateMany({}, { $set: { permissions: [] } });

    // insert the new permission
    await db.collection('permissions').insertOne({
      name: 'History Create',
      description: 'Allows creating history entries',
      resource: 'history',
      action: 'create',
      isActive: true,
      createdAt: new Date(),
      createdBy: adminUser._id,
    });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // find admin user
    const adminUser = await db
      .collection('users')
      .findOne({ email: 'admin@perilines.com.ua' });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // clean the collection
    await db.collection('permissions').deleteMany({});

    // clean permissions from roles
    await db.collection('roles').updateMany({}, { $set: { permissions: [] } });

    // insert former permissions
    const result = await db.collection('permissions').insertMany([
      {
        name: 'User Read',
        description: 'Read user information',
        resource: 'user',
        action: 'read',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'User Write',
        description: 'Create and update user information',
        resource: 'user',
        action: 'write',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Admin All',
        description: 'Full administrative access',
        resource: 'admin',
        action: 'all',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
    ]);

    await db
      .collection('roles')
      .updateOne(
        { name: 'User' },
        { $set: { permissions: [result.insertedIds[0]] } },
      );
    await db
      .collection('roles')
      .updateOne(
        { name: 'Moderator' },
        { $set: { permissions: [result.insertedIds[1]] } },
      );
    await db
      .collection('roles')
      .updateOne(
        { name: 'Admin' },
        { $set: { permissions: [result.insertedIds[2]] } },
      );
  },
};
