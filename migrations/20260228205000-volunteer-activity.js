module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const mediaAssetSchema = {
      bsonType: 'object',
      required: [
        'key',
        'url',
        'size',
        'mimeType',
        'originalName',
        'uploadedAt',
      ],
      properties: {
        key: {
          bsonType: 'string',
          description: 'Storage key in R2',
        },
        url: {
          bsonType: 'string',
          description: 'Public URL to access uploaded media',
        },
        size: {
          bsonType: 'number',
          description: 'File size in bytes',
        },
        mimeType: {
          bsonType: 'string',
          description: 'MIME type of the file',
        },
        originalName: {
          bsonType: 'string',
          description: 'Original uploaded file name',
        },
        uploadedAt: {
          bsonType: 'date',
          description: 'Upload timestamp',
        },
        checksum: {
          bsonType: 'string',
          description: 'Integrity hash of the uploaded file',
        },
      },
    };

    await db.createCollection('volunteer_category', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Volunteer activity category name',
            },
          },
        },
      },
    });

    await db
      .collection('volunteer_category')
      .createIndex({ name: 1 }, { unique: true });

    const volunteerCategories = [
      { name: 'Feeding' },
      { name: 'Cleaning' },
      { name: 'Medical' },
      { name: 'Transport' },
      { name: 'Adoption' },
      { name: 'Fundraising' },
      { name: 'Administrative' },
      { name: 'Other' },
    ];

    await db.collection('volunteer_category').insertMany(volunteerCategories);

    await db.createCollection('volunteer_acts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'volunteerId',
            'types',
            'status',
            'sessionStart',
            'createdAt',
            'createdBy',
          ],
          properties: {
            volunteerId: {
              bsonType: 'objectId',
              description: 'Reference to the volunteer (users collection)',
            },
            types: {
              bsonType: 'objectId',
              description:
                'Reference to category in volunteer_category collection',
            },
            status: {
              bsonType: 'string',
              enum: ['scheduled', 'pending', 'approved', 'rejected'],
              description: 'Approval status of the act',
            },
            animalId: {
              bsonType: 'array',
              description:
                'References to one or more animals this activity was related to',
              items: {
                bsonType: 'objectId',
              },
            },
            notes: {
              bsonType: 'string',
              description: 'Long notes and details about the activity',
            },
            managedBy: {
              bsonType: 'objectId',
              description:
                'ID of the manager who processed the activity report',
            },
            managedAt: {
              bsonType: 'date',
              description: 'Date when the activity report was processed',
            },
            equipments: {
              bsonType: 'array',
              description: 'Equipment items used during this activity',
              items: {
                bsonType: 'object',
                required: ['itemId', 'conditionBefore', 'conditionAfter'],
                properties: {
                  itemId: {
                    bsonType: 'objectId',
                    description:
                      'Reference to the item in reports_inventory collection',
                  },
                  conditionBefore: {
                    bsonType: 'string',
                    enum: ['new', 'good', 'fair', 'poor', 'broken'],
                    description: 'Condition of the item before the activity',
                  },
                  conditionAfter: {
                    bsonType: 'string',
                    enum: ['new', 'good', 'fair', 'poor', 'broken'],
                    description: 'Condition of the item after the activity',
                  },
                  notes: {
                    bsonType: 'string',
                    description: 'Additional notes about the equipment usage',
                  },
                  media: {
                    bsonType: 'array',
                    description:
                      'Photo/video files attached to this equipment usage',
                    items: mediaAssetSchema,
                  },
                },
              },
            },
            documents: {
              bsonType: 'array',
              description:
                'Photo/video files used as proof of volunteer activity',
              items: mediaAssetSchema,
            },
            sessionStart: {
              bsonType: 'date',
              description: 'Date and time when the volunteer activity started',
            },
            sessionEnd: {
              bsonType: 'date',
              description: 'Date and time when the volunteer activity ended',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of record creation',
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'ID of the user who created the record',
            },
          },
        },
      },
    });

    await db
      .collection('volunteer_acts')
      .createIndex({ volunteerId: 1, sessionStart: -1 });
    await db.collection('volunteer_acts').createIndex({ types: 1 });
    await db.collection('volunteer_acts').createIndex({ status: 1 });
    await db.collection('volunteer_acts').createIndex({ sessionStart: -1 });
    await db.collection('volunteer_acts').createIndex({ sessionEnd: -1 });
    await db.collection('volunteer_acts').createIndex({ managedBy: 1 });
    await db.collection('volunteer_acts').createIndex({ animalId: 1 });

    // Create permissions for volunteer acts management
    const adminUser = await db
      .collection('users')
      .findOne({ email: 'admin@perilines.com.ua' });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    await db.collection('permissions').insertMany([
      {
        name: 'View Volunteer Acts',
        description: 'Allows viewing volunteer activity records',
        resource: 'act',
        action: 'read',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Create Volunteer Act',
        description: 'Allows creating volunteer activity records',
        resource: 'act',
        action: 'create',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Update Volunteer Act',
        description: 'Allows updating volunteer activity records',
        resource: 'act',
        action: 'update',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Delete Volunteer Act',
        description: 'Allows deleting volunteer activity records',
        resource: 'act',
        action: 'delete',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
      {
        name: 'Regulate Volunteer Act',
        description:
          'Allows accepting or rejecting volunteer activity records with an optional description',
        resource: 'act',
        action: 'regulate',
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
    await db.collection('volunteer_acts').drop();
    await db.collection('volunteer_category').drop();

    const permissions = await db
      .collection('permissions')
      .find({
        resource: 'act',
        action: { $in: ['read', 'create', 'update', 'delete', 'regulate'] },
      })
      .toArray();

    if (permissions.length > 0) {
      const ids = permissions.map(({ _id }) => _id);

      await db.collection('permissions').deleteMany({ _id: { $in: ids } });
      await db
        .collection('roles')
        .updateMany({}, { $pull: { permissions: { $in: ids } } });
    }
  },
};
