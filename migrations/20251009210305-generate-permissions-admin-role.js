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

    const result = await db.collection('permissions').insertMany([
      {
        name: 'Admin Assign Role',
        description: 'Allows assigning roles to users',
        resource: 'role',
        action: 'assign',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Admin Create Role',
        description: 'Allows creating new roles',
        resource: 'role',
        action: 'create',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Admin Delete Role',
        description: 'Allows deleting roles',
        resource: 'role',
        action: 'delete',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
    ]);

    // assign role to admin
    await db
      .collection('roles')
      .updateOne(
        { name: 'Admin' },
        {
          $addToSet: {
            permissions: { $each: Object.values(result.insertedIds) },
          },
        },
      );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    const permissions = await db
      .collection('permissions')
      .find({
        $or: [
          { resource: 'role', action: 'assign' },
          { resource: 'role', action: 'create' },
          { resource: 'role', action: 'delete' },
        ],
      })
      .toArray();

    if (permissions.length === 0) {
      throw new Error('Permission not found');
    }

    const ids = permissions.map((p) => p._id);

    // delete the permission
    await db.collection('permissions').deleteMany({ _id: { $in: ids } });

    // remove permission from roles
    await db
      .collection('roles')
      .updateOne({ name: 'Admin' }, { $pull: { permissions: { $in: ids } } });
  },
};
