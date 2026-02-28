module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const adminUser = await db
      .collection('users')
      .findOne({ email: 'admin@perilines.com.ua' });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const result = await db.collection('permissions').insertMany([
      {
        name: 'Send Email',
        description: 'Allows sending emails on behalf of the foundation',
        resource: 'email',
        action: 'send',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
    ]);

    await db.collection('roles').updateOne(
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
        resource: 'email',
        action: { $in: ['send'] },
      })
      .toArray();

    if (permissions.length > 0) {
      const ids = permissions.map((p) => p._id);

      await db.collection('permissions').deleteMany({ _id: { $in: ids } });
      await db
        .collection('roles')
        .updateMany({}, { $pull: { permissions: { $in: ids } } });
    }
  },
};
