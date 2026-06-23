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

    const createdAt = new Date();

    await db.collection('permissions').insertMany([
      {
        name: 'Registry Map Read',
        description: 'Allows reading the registry map page',
        resource: 'registry',
        action: 'map:read',
        isActive: true,
        createdAt,
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
    await db.collection('permissions').deleteMany({
      resource: 'registry',
      action: { $in: ['map:read'] },
    });
  },
};
