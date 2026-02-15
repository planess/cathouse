module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.createCollection('inventory_storage', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'location', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the storage location',
            },
            location: {
              bsonType: 'object',
              description: 'Physical location of the storage',
              properties: {
                latitude: {
                  bsonType: 'double',
                  description: 'Latitude of the storage location',
                },
                longitude: {
                  bsonType: 'double',
                  description: 'Longitude of the storage location',
                },
              },
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });
    await db.createCollection('inventory_categories', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the inventory category',
            },
            inherits: {
              bsonType: 'objectId',
              description:
                'ID of the inventory category this category inherits from',
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });
    await db.createCollection('reports_inventory', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'type', 'quantity', 'category', 'storage', 'createdAt'],
          properties: {
            sku: {
              bsonType: 'string',
              description: 'Stock Keeping Unit, unique identifier for the item',
            },
            name: {
              bsonType: 'string',
              description: 'Name of the equipment or consumable',
            },
            type: {
              bsonType: 'string',
              description: 'Type of the item (e.g., equipment, consumable)',
            },
            quantity: {
              bsonType: 'int',
              description: 'Quantity of the item in stock',
            },
            expirationDate: {
              bsonType: 'date',
              description: 'Expiration date for consumables',
            },
            category: {
              bsonType: 'objectId',
              description: 'ID of the inventory category',
            },
            storage: {
              bsonType: 'objectId',
              description: 'ID of the storage location',
            },
            images: {
              bsonType: 'array',
              description: 'Array of image URLs for the item',
              items: {
                bsonType: 'string',
                description: 'URL of the image',
              },
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
          },
        },
      },
    });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('reports_inventory').drop();
    await db.collection('inventory_categories').drop();
    await db.collection('inventory_storage').drop();
  },
};
