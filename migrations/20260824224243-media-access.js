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

    await db.collection('permissions').insertMany([
      {
        name: 'Review Media',
        description: 'Allows reviewing media on the cloud',
        resource: 'media',
        action: 'review',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Upload Media',
        description: 'Allows uploading media to the cloud',
        resource: 'media',
        action: 'upload',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Delete Media',
        description: 'Allows deleting media from the cloud',
        resource: 'media',
        action: 'delete',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
    ]);
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
        resource: 'media',
        action: { $in: ['review', 'upload', 'delete'] },
      })
      .toArray();

    if (permissions.length > 0) {
      const ids = permissions.map((p) => p._id);

      await db.collection('permissions').deleteMany({ _id: { $in: ids } });
    }
  },
};
