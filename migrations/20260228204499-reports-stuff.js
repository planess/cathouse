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

    await db.createCollection('inventory_items', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'type', 'category', 'createdAt', 'createdBy'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Name of the consumable or asset',
            },
            type: {
              bsonType: 'string',
              enum: ['consumable', 'asset'],
              description: 'Type of the item (consumable or asset)',
            },
            category: {
              bsonType: 'objectId',
              description: 'ID of the inventory category',
            },
            // usage: {
            //   bsonType: 'array',
            //   description: 'History of usage sessions for this item',
            //   items: {
            //     bsonType: 'object',
            //     required: ['usedBy', 'purpose', 'startedAt'],
            //     properties: {
            //       usedBy: {
            //         bsonType: 'objectId',
            //         description: 'ID of the user who used the item',
            //       },
            //       purpose: {
            //         bsonType: 'string',
            //         description: 'Description of how the item was used',
            //       },
            //       startedAt: {
            //         bsonType: 'date',
            //         description: 'When usage started',
            //       },
            //       endedAt: {
            //         bsonType: 'date',
            //         description: 'When usage ended',
            //       },
            //       notes: {
            //         bsonType: 'string',
            //         description: 'Additional notes about the usage',
            //       },
            //     },
            //   },
            // },
            // transitions: {
            //   bsonType: 'array',
            //   description:
            //     'History of acceptance and release transitions for this item',
            //   items: {
            //     bsonType: 'object',
            //     required: ['type', 'date', 'performedBy'],
            //     properties: {
            //       type: {
            //         bsonType: 'string',
            //         enum: ['acceptance', 'release'],
            //         description:
            //           'Whether the item was accepted to or released from the balance',
            //       },
            //       fromType: {
            //         bsonType: 'string',
            //         enum: ['user', 'storage'],
            //         description: 'Source type',
            //       },
            //       fromId: {
            //         bsonType: 'objectId',
            //         description: 'ID of the source user or storage',
            //       },
            //       toType: {
            //         bsonType: 'string',
            //         enum: ['user', 'storage'],
            //         description: 'Destination type',
            //       },
            //       toId: {
            //         bsonType: 'objectId',
            //         description: 'ID of the destination user or storage',
            //       },
            //       reason: {
            //         bsonType: 'string',
            //         description: 'Reason for the transition',
            //       },
            //       notes: {
            //         bsonType: 'string',
            //         description: 'Additional notes',
            //       },
            //       date: {
            //         bsonType: 'date',
            //         description: 'Date of the transition',
            //       },
            //       performedBy: {
            //         bsonType: 'objectId',
            //         description: 'ID of the user who performed the transition',
            //       },
            //     },
            //   },
            // },
            createdAt: {
              bsonType: 'date',
              description: 'Date of creation',
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'ID of the user who created the record',
            },
          },
        },
      },
    });

    await db.createCollection('inventory_consumables', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'itemId',
            'batchNumber',
            'unit',
            'firstTransactionId',
            'lastTransactionId',
          ],
          properties: {
            itemId: {
              bsonType: 'objectId',
              description:
                'ID of the inventory item this consumable record corresponds to',
            },
            batchNumber: {
              bsonType: 'string',
              description: 'Batch number for the consumable item',
            },
            expiryDate: {
              bsonType: 'date',
              description: 'Expiration date for the consumable item',
            },
            unit: {
              bsonType: 'string',
              description:
                'Unit of measurement for the quantity (e.g., pcs, kg, liters)',
            },
            firstTransactionId: {
              bsonType: 'objectId',
              description:
                'ID of the first acceptance transaction for this consumable batch',
            },
            lastTransactionId: {
              bsonType: 'objectId',
              description:
                'ID of the most recent transaction for this consumable batch',
            },
          },
        },
      },
    });

    await db.createCollection('inventory_assets', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'itemId',
            'individualId',
            'firstTransactionId',
            'lastTransactionId',
          ],
          properties: {
            itemId: {
              bsonType: 'objectId',
              description:
                'ID of the inventory item this asset record corresponds to',
            },
            serialNumber: {
              bsonType: 'string',
              description: 'Factory serial number of the asset',
            },
            individualId: {
              bsonType: 'string',
              description:
                'Individual internal identifier for the asset (e.g., inventory tag number)',
            },
            firstTransactionId: {
              bsonType: 'objectId',
              description:
                'ID of the first acceptance transaction for this asset',
            },
            lastTransactionId: {
              bsonType: 'objectId',
              description: 'ID of the most recent transaction for this asset',
            },
          },
        },
      },
    });

    await db.createCollection('inventory_transactions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['entityId', 'type', 'from', 'date', 'createdAt', 'createdBy'],
          properties: {
            entityId: {
              bsonType: 'objectId',
              description:
                'ID of the inventory item (asset or consumable) this transaction corresponds to',
            },
            type: {
              bsonType: 'string',
              enum: ['donation', 'purchase', 'transfer', 'release', 'disposal'],
              description: 'Type of the transaction',
            },
            from: {
              bsonType: 'object',
              description:
                'Where the item is coming from (user or storage). For donations and purchases',
              required: ['type'],
              properties: {
                type: {
                  bsonType: 'string',
                  enum: [
                    'people',
                    'clinic',
                    'shop',
                    'organization',
                    'volunteer',
                  ],
                  description: 'Type of the source',
                },
                id: {
                  bsonType: 'objectId',
                  description: 'ID of the source entity',
                },
                name: {
                  bsonType: 'string',
                  description: 'Name of the source entity',
                },
              },
            },
            to: {
              bsonType: 'object',
              description:
                'Where the item is going to (user or storage). For releases and transfers',
              required: ['type'],
              properties: {
                type: {
                  bsonType: 'string',
                  enum: ['people', 'clinic', 'volunteer', 'storage'],
                  description:
                    'Type of the destination (for releases and transfers)',
                },
                id: {
                  bsonType: 'objectId',
                  description: 'ID of the destination entity',
                },
                name: {
                  bsonType: 'string',
                  description: 'Name of the destination entity',
                },
              },
            },
            quantity: {
              bsonType: 'number',
              description:
                'Quantity of the item involved in the transaction (for consumables)',
            },
            remainingQuantity: {
              bsonType: 'number',
              description:
                'Remaining quantity of the item after the transaction (for consumables)',
            },
            date: {
              bsonType: 'date',
              description: 'Date and time when the transaction occurred',
            },
            condition: {
              bsonType: 'string',
              enum: ['new', 'good', 'fair', 'poor', 'broken'],
              description:
                'Physical condition of the item at the time of the transaction (for assets)',
            },
            damageDescription: {
              bsonType: 'string',
              description:
                'Description of any damage to the item at the time of the transaction (for assets)',
            },
            notes: {
              bsonType: 'string',
              description: 'Additional notes about the transaction',
            },
            estimatedCost: {
              bsonType: 'decimal',
              description:
                'Estimated cost of the item at the time of the transaction',
            },
            media: {
              bsonType: 'array',
              description:
                'Array of media URLs (e.g., photos of the item during the transaction)',
              items: {
                bsonType: 'object',
                required: ['key', 'url', 'uploadedAt', 'checksum'],
                properties: {
                  key: {
                    bsonType: 'string',
                    description: 'Key of the document in the storage',
                  },
                  url: {
                    bsonType: 'string',
                    description: 'Public URL of the document',
                  },
                  size: {
                    bsonType: 'number',
                    description: 'Size of the document in bytes',
                  },
                  mimeType: {
                    bsonType: 'string',
                    description: 'MIME type of the document',
                  },
                  originalName: {
                    bsonType: 'string',
                    description: 'Original name of the uploaded document',
                  },
                  uploadedAt: {
                    bsonType: 'date',
                    description: 'Date when the document was uploaded',
                  },
                  isDeleted: {
                    bsonType: 'bool',
                    description: 'Indicates if the document has been deleted',
                  },
                  checksum: {
                    bsonType: 'string',
                    description:
                      'Checksum of the document for integrity verification',
                  },
                },
              },
            },
            createdAt: {
              bsonType: 'date',
              description: 'Date when the report was created',
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'ID of the user who created the report',
            },
          },
        },
      },
    });

    await db.collection('inventory_items').createIndex({ type: 1 });
    await db.collection('inventory_items').createIndex({ category: 1 });

    await db.collection('inventory_consumables').createIndex({ itemId: 1 });
    await db
      .collection('inventory_consumables')
      .createIndex({ firstTransactionId: 1 });
    await db
      .collection('inventory_consumables')
      .createIndex({ lastTransactionId: 1 });

    await db.collection('inventory_assets').createIndex({ itemId: 1 });
    await db
      .collection('inventory_assets')
      .createIndex({ firstTransactionId: 1 });
    await db
      .collection('inventory_assets')
      .createIndex({ lastTransactionId: 1 });

    await db.collection('inventory_transactions').createIndex({ entityId: 1 });
    await db.collection('inventory_transactions').createIndex({ type: 1 });
    await db.collection('inventory_transactions').createIndex({ from: 1 });
    await db.collection('inventory_transactions').createIndex({ to: 1 });
    await db.collection('inventory_transactions').createIndex({ date: 1 });

    // Create permissions for equipment management
    const adminUser = await db
      .collection('users')
      .findOne({ email: 'admin@perilines.com.ua' });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const result = await db.collection('permissions').insertMany([
      {
        name: 'Manage equipment',
        description:
          'Allows managing equipment and assets on the balance sheet',
        resource: 'equipment',
        action: 'manage',
        isActive: true,
        createdAt: new Date(),
        createdBy: adminUser._id,
      },
    ]);

    const adminRole = adminUser.roles[0]; // Assuming the first role is Admin

    // Assign permissions to Admin role
    await db.collection('roles').updateOne(
      { _id: adminRole },
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
    await db.collection('inventory_storage').drop();
    await db.collection('inventory_categories').drop();
    await db.collection('inventory_items').drop();
    await db.collection('inventory_consumables').drop();
    await db.collection('inventory_assets').drop();
    await db.collection('inventory_transactions').drop();

    const permissions = await db
      .collection('permissions')
      .find({
        resource: 'equipment',
        action: 'manage',
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
