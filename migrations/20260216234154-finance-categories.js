const { Decimal128 } = require('mongodb');

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('finance_incoming_goals', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'specific', 'balance', 'active', 'createdAt'],
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
            specific: {
              bsonType: 'bool',
              description:
                'Whether this category is specific and should not be inherited from',
            },
            balance: {
              bsonType: 'decimal',
              description: 'Current balance of this category',
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

    await db.createCollection('finance_outgoing_purposes', {
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
            active: {
              bsonType: 'bool',
              description: 'Whether this category is active',
            },
            linkedTo: {
              bsonType: 'objectId',
              description:
                'ID of the finance incoming goal this outgoing purpose is linked to',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });

    // migrate data from finance_incoming_categories to finance_incoming_goals with 'insertMany'
    const incomingCategories = await db
      .collection('finance_incoming_categories')
      .find()
      .toArray();

    if (incomingCategories.length > 0) {
      const financeCategories = incomingCategories.map(
        ({ _id, name, createdAt, inherits }) => ({
          ...(inherits ? { inherits } : {}),
          _id,
          name,
          specific: false,
          balance: Decimal128.fromString('0'),
          active: true,
          createdAt: createdAt || new Date(),
        }),
      );

      await db
        .collection('finance_incoming_goals')
        .insertMany(financeCategories);
    }

    // migrate data from finance_outgoing_categories to finance_outgoing_purposes with 'insertMany'
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

      await db
        .collection('finance_outgoing_purposes')
        .insertMany(financeCategories);
    }

    db.collection('finance_incoming_goals').createIndex({ active: 1 });
    db.collection('finance_incoming_goals').createIndex({ inherits: 1 });
    db.collection('finance_incoming_goals').createIndex({ specific: 1 });

    db.collection('finance_outgoing_purposes').createIndex({ active: 1 });
    db.collection('finance_outgoing_purposes').createIndex({ inherits: 1 });
    db.collection('finance_outgoing_purposes').createIndex({ linkedTo: 1 });

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

    // migrate data from finance_incoming_goals to finance_incoming_categories with 'insertMany'
    const incomingCategories = await db
      .collection('finance_incoming_goals')
      .find()
      .toArray();

    if (incomingCategories.length > 0) {
      const financeCategories = incomingCategories.map(
        ({ _id, name, createdAt, inherits }) => ({
          ...(inherits ? { inherits } : {}),
          _id,
          name,
          createdAt: createdAt || new Date(),
        }),
      );

      await db
        .collection('finance_incoming_categories')
        .insertMany(financeCategories);
    }

    const outgoingCategories = await db
      .collection('finance_outgoing_purposes')
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

    await db.collection('finance_incoming_goals').drop();
    await db.collection('finance_outgoing_purposes').drop();
  },
};
