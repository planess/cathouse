module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('finance_categories', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'active', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the finance category',
            },
            inherits: {
              bsonType: 'objectId',
              description:
                'ID of the finance category this category inherits from',
            },
            balance: {
              bsonType: 'decimal',
              description:
                'Current balance of this category is considered as a targeted amount',
            },
            active: {
              bsonType: 'bool',
              description: 'Whether this category is active',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });

    // migrate data from finance_outgoing_categories with 'insertMany'
    const outgoingCategories = await db
      .collection('finance_outgoing_categories')
      .find()
      .toArray();

    if (outgoingCategories.length > 0) {
      const financeCategories = outgoingCategories.map(
        ({ _id, name, createdAt, inherits }) => ({
          ...(inherits ? { inherits } : {}),
          _id,
          name,
          active: true,
          createdAt: createdAt || new Date(),
        }),
      );

      await db.collection('finance_categories').insertMany(financeCategories);
    }

    // remove incoming categories as they are not used in the app and their data is not critical
    /// action will be performed later that affect `reports_finance`

    db.collection('finance_categories').createIndex({ active: 1 });
    db.collection('finance_categories').createIndex({ inherits: 1 });
    db.collection('finance_categories').createIndex({ linkedTo: 1 });

    await db.collection('finance_incoming_categories').drop();
    await db.collection('finance_outgoing_categories').drop();
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.createCollection('finance_incoming_categories', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the finance incoming category',
            },
            inherits: {
              bsonType: 'objectId',
              description:
                'ID of the finance incoming category this category inherits from',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });

    await db.createCollection('finance_outgoing_categories', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the finance outgoing category',
            },
            inherits: {
              bsonType: 'objectId',
              description:
                'ID of the finance outgoing category this category inherits from',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });

    const outgoingCategories = await db
      .collection('finance_categories')
      .find()
      .toArray();

    if (outgoingCategories.length > 0) {
      const financeCategories = outgoingCategories.map(
        ({ _id, name, createdAt, inherits }) => ({
          ...(inherits ? { inherits } : {}),
          _id,
          name,
          createdAt: createdAt || new Date(),
        }),
      );

      await db
        .collection('finance_outgoing_categories')
        .insertMany(financeCategories);
    }

    await db.collection('finance_categories').drop();
  },
};
