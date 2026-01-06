module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const date = new Date();

    const userRecord = await db
      .collection('users')
      .findOne({ email: 'admin@perilines.com.ua' });
    const userID = userRecord?._id;

    await db.collection('permissions').insertMany([
      {
        resource: 'history',
        action: 'publish',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Publish Own History',
        description: 'Permission to publish own history entries',
      },
      {
        resource: 'history',
        action: 'delete',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Delete Any History',
        description:
          'Permission for administrator to delete any history entries',
      },
      {
        resource: 'history',
        action: 'update:any',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Update Any History',
        description:
          'Permission for administrator to update any history entries',
      },
      {
        resource: 'history',
        action: 'publish:any',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Publish Any History',
        description:
          'Permission for administrator to publish any history entries',
      },
      {
        resource: 'informator',
        action: 'create',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Create Informator Entries',
        description: 'Permission to create informator entries',
      },
      {
        resource: 'informator',
        action: 'update',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Update Informator Entries',
        description: 'Permission to update informator entries',
      },
      {
        resource: 'informator',
        action: 'delete',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Delete Informator Entries',
        description: 'Permission to delete informator entries',
      },
      {
        resource: 'clinic',
        action: 'create',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Create Clinic Entries',
        description: 'Permission to create clinic entries',
      },
      {
        resource: 'clinic',
        action: 'update',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Update Clinic Entries',
        description: 'Permission to update clinic entries',
      },
      {
        resource: 'clinic',
        action: 'delete',
        isActive: true,
        createdAt: date,
        createdBy: userID,
        name: 'Delete Clinic Entries',
        description: 'Permission to delete clinic entries',
      },
    ]);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // remove the permissions added in the up migration
    await db.collection('permissions').deleteMany({
      $or: [
        { resource: 'history', action: 'publish' },
        { resource: 'history', action: 'delete' },
        { resource: 'history', action: 'update:any' },
        { resource: 'history', action: 'publish:any' },
        { resource: 'informator', action: 'create' },
        { resource: 'informator', action: 'update' },
        { resource: 'informator', action: 'delete' },
        { resource: 'clinic', action: 'create' },
        { resource: 'clinic', action: 'update' },
        { resource: 'clinic', action: 'delete' },
      ],
    });
  },
};
