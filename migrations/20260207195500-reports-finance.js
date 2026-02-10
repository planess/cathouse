const { inherits } = require('util');

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('bank_accounts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'iban', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the bank account',
            },
            iban: {
              bsonType: 'string',
              description: 'IBAN of the bank account',
            },
            balance: {
              bsonType: 'number',
              description: 'Balance of the bank account',
            },
            isActive: {
              bsonType: 'bool',
              description: 'Whether the bank account is active',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });

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

    await db.createCollection('reports_finance', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['createdAt', 'createdBy', 'type', 'amount', 'category'],
          properties: {
            type: {
              bsonType: 'string',
              description: 'Type of the report (incoming, outgoing, debt)',
            },
            description: {
              bsonType: 'string',
              description: 'Description of the report',
            },
            category: {
              bsonType: 'objectId',
              description: 'ID of the category of the report',
            },
            amount: {
              bsonType: 'number',
              description: 'Amount of the report',
            },
            account: {
              bsonType: 'objectId',
              description: 'ID of the bank account of the report',
            },
            balance: {
              bsonType: 'number',
              description: 'Balance after the report',
            },
            details: {
              bsonType: 'array',
              description: 'Details of the report',
              items: {
                bsonType: 'object',
                required: ['description', 'amount'],
                properties: {
                  category: {
                    bsonType: 'objectId',
                    description: 'ID of the category of the detail',
                  },
                  description: {
                    bsonType: 'string',
                    description: 'Description of the detail',
                  },
                  amount: {
                    bsonType: 'number',
                    description: 'Amount of the detail',
                  },
                },
              },
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'ID of the user who created the report',
            },
          },
        },
      },
    });

    db.collection('reports_finance').createIndex({ type: 1 });
    db.collection('reports_finance').createIndex({ category: 1 });
    // create index on details => category
    db.collection('reports_finance').createIndex({ 'details.category': 1 });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('reports_finance').drop();
    await db.collection('bank_accounts').drop();
    await db.collection('finance_incoming_categories').drop();
    await db.collection('finance_outgoing_categories').drop();
  },
};
