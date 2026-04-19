const { Decimal128, ObjectId } = require('mongodb');

// convert Decimal128 values into plain numbers for rollback
function toNumber(val) {
  if (val === null) {
    return val;
  } else if (val && val._bsontype === 'Decimal128') {
    return Number(val.toString());
  }

  return val;
}

// helper to convert various input forms to Decimal128
function toDecimal(val) {
  if (val === null) {
    return null;
  } else if (val && val._bsontype === 'Decimal128') {
    return val;
  }

  return Decimal128.fromString(String(val));
}

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // helper to convert various input forms to Decimal128 (moved to module scope)
    await db.createCollection('finance_incoming_reports', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'account',
            'amount',
            'balance',
            'operationDate',
            'createdAt',
            'createdBy',
          ],
          properties: {
            account: {
              bsonType: 'objectId',
              description: 'ID of the finance account',
            },
            amount: {
              bsonType: 'decimal',
              description: 'Amount of the transaction',
            },
            balance: {
              bsonType: 'decimal',
              description:
                'Balance AFTER the transaction in the selected account',
            },
            deposit: {
              bsonType: 'decimal',
              description: 'Amount of the deposit in category',
            },
            sender: {
              bsonType: 'string',
              description: 'Name of the sender of the transaction',
            },
            description: {
              bsonType: 'string',
              description:
                'Payment purpose of the transaction. It can indicate the targeted receipt into account, e.g. "Donation", "Grant", "Sponsorship" etc.',
            },
            operationDate: {
              bsonType: 'date',
              description: 'Date when the transaction took place',
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

    await db.createCollection('finance_outgoing_reports', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'account',
            'amount',
            'balance',
            'recipient',
            'description',
            'linkedTo',
            'operationDate',
            'createdAt',
            'createdBy',
          ],
          properties: {
            account: {
              bsonType: 'objectId',
              description: 'ID of the finance account',
            },
            amount: {
              bsonType: 'decimal',
              description: 'Amount of the transaction',
            },
            balance: {
              bsonType: 'decimal',
              description:
                'Balance AFTER the transaction in the selected account',
            },
            recipient: {
              bsonType: 'string',
              description: 'Name of the recipient of the transaction',
            },
            iban: {
              bsonType: 'string',
              description: 'IBAN of the recipient of the transaction',
            },
            description: {
              bsonType: 'string',
              description: 'Payment purpose of the transaction',
            },
            linkedTo: {
              bsonType: 'objectId',
              description:
                'ID of the outgoing category this report is linked to',
            },
            operationDate: {
              bsonType: 'date',
              description: 'Date when the transaction took place',
            },
            withdrawal: {
              bsonType: 'array',
              description:
                'List of withdrawals that this outgoing report consists of (used for splitting the amount into multiple categories)',
              items: {
                bsonType: 'object',
                required: ['category', 'amount', 'balance'],
                properties: {
                  category: {
                    bsonType: 'objectId',
                    description:
                      'ID of the outgoing category this withdrawal is linked to',
                  },
                  amount: {
                    bsonType: 'decimal',
                    description: 'Amount of the withdrawal',
                  },
                  balance: {
                    bsonType: 'decimal',
                    description:
                      'Balance AFTER the withdrawal in the selected account',
                  },
                },
              },
            },
            details: {
              bsonType: 'array',
              description: 'Additional details of the transaction',
              items: {
                bsonType: 'object',
                required: ['description', 'amount'],
                properties: {
                  category: {
                    bsonType: 'objectId',
                    description:
                      'ID of the nested outgoing category this detail is linked to',
                  },
                  description: {
                    bsonType: 'string',
                    description: 'Description of the detail',
                  },
                  amount: {
                    bsonType: 'decimal',
                    description: 'Amount of the detail',
                  },
                },
              },
            },
            documents: {
              bsonType: 'array',
              description: 'List of documents related to the debt',
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

    await db.createCollection('finance_debt_reports', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'amount',
            'recipient',
            'linkedTo',
            'createdAt',
            'createdBy',
          ],
          properties: {
            amount: {
              bsonType: 'decimal',
              description: 'Approximate amount of the transaction',
            },
            recipient: {
              bsonType: 'string',
              description: 'Name of the recipient of the transaction',
            },
            description: {
              bsonType: 'string',
              description: 'Payment purpose of the transaction',
            },
            linkedTo: {
              bsonType: 'objectId',
              description: 'ID of the debt category this report is linked to',
            },
            documents: {
              bsonType: 'array',
              description: 'List of documents related to the debt',
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

    const financeIncomingReports = db.collection('finance_incoming_reports');
    const financeOutgoingReports = db.collection('finance_outgoing_reports');
    const financeDebtReports = db.collection('finance_debt_reports');

    await financeIncomingReports.createIndex({ account: 1 });
    await financeIncomingReports.createIndex({ sender: 1 });
    await financeIncomingReports.createIndex({ linkedTo: 1 });
    await financeIncomingReports.createIndex({ operationDate: 1 });

    await financeOutgoingReports.createIndex({ account: 1 });
    await financeOutgoingReports.createIndex({ recipient: 1 });
    await financeOutgoingReports.createIndex({ iban: 1 });
    await financeOutgoingReports.createIndex({ linkedTo: 1 });
    await financeOutgoingReports.createIndex({ operationDate: 1 });
    await financeOutgoingReports.createIndex({ 'withdrawal.category': 1 });
    await financeOutgoingReports.createIndex({ 'details.category': 1 });

    await financeDebtReports.createIndex({ recipient: 1 });
    await financeDebtReports.createIndex({ linkedTo: 1 });

    // transfer the data from reports_finance to the new collections
    // convert `amount` and `balance` into Decimal128 for the new collections
    const reports = await db.collection('reports_finance').find().toArray();
    const incomingReports = [];
    const outgoingReports = [];
    const debtReports = [];

    for (const report of reports) {
      const {
        _id,
        type,
        account,
        balance,
        description,
        amount,
        category,
        createdAt,
        createdBy,
      } = report;

      if (type === 'incoming') {
        incomingReports.push({
          _id,
          account,
          balance: toDecimal(balance), // ensure balance stored as Decimal128
          amount: toDecimal(amount), // ensure amount stored as Decimal128
          description,
          sender: 'unknown?',
          operationDate: createdAt,
          createdAt,
          createdBy,
        });
      } else if (type === 'outgoing') {
        // convert nested detail amounts and top-level amount/balance to Decimal128
        const details = report.details?.map((detail) => ({
          category: detail.category,
          description: detail.description,
          amount: toDecimal(detail.amount), // ensure amount stored as Decimal128
        }));

        outgoingReports.push({
          ...(details ? { details } : {}),
          _id,
          account,
          balance: toDecimal(balance), // ensure balance stored as Decimal128
          amount: toDecimal(amount), // ensure amount stored as Decimal128
          recipient: 'unknown?',
          iban: 'unknown?',
          description,
          linkedTo: category,
          operationDate: createdAt,
          createdAt,
          createdBy,
        });
      } else if (type === 'debt') {
        debtReports.push({
          _id,
          amount: toDecimal(amount), // ensure amount stored as Decimal128
          recipient: 'unknown?',
          description,
          linkedTo: category,
          createdAt,
          createdBy,
        });
      }
    }

    if (incomingReports.length > 0) {
      await financeIncomingReports.insertMany(incomingReports);
    }

    if (outgoingReports.length > 0) {
      await financeOutgoingReports.insertMany(outgoingReports);
    }

    if (debtReports.length > 0) {
      await financeDebtReports.insertMany(debtReports);
    }

    // drop the old collection
    await db.collection('reports_finance').drop();
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // When rolling back, convert Decimal128 fields back into plain numbers
    // try to restore `reports_finance` by merging documents
    await db.createCollection('reports_finance', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'createdAt',
            'createdBy',
            'type',
            'amount',
            'category',
            'account',
            'balance',
          ],
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

    const incoming = await db
      .collection('finance_incoming_reports')
      .find()
      .toArray();
    const outgoing = await db
      .collection('finance_outgoing_reports')
      .find()
      .toArray();
    const debt = await db.collection('finance_debt_reports').find().toArray();

    const reports = [];

    // Convert Decimal128 values back to numbers for the legacy `reports_finance` collection
    for (const record of incoming) {
      reports.push({
        _id: record._id,
        type: 'incoming',
        account: record.account,
        balance: toNumber(record.balance),
        amount: toNumber(record.amount),
        description: record.description,
        category: ObjectId.createFromBase64('YWJjZGVmZ2VmZ2hp'), // incoming reports didn't have categories, set to a default empty category ID for compatibility
        operationDate: record.operationDate ?? record.createdAt,
        createdAt: record.createdAt,
        createdBy: record.createdBy,
      });
    }

    for (const record of outgoing) {
      reports.push({
        _id: record._id,
        type: 'outgoing',
        account: record.account,
        balance: toNumber(record.balance),
        amount: toNumber(record.amount),
        description: record.description,
        details: record.details?.map((d) => ({
          ...d,
          amount: toNumber(d.amount),
        })),
        category: record.linkedTo,
        operationDate: record.operationDate ?? record.createdAt,
        createdAt: record.createdAt,
        createdBy: record.createdBy,
      });
    }

    // find first outgoing account to use for debt reports (since they didn't have account info, we need to set something for the legacy collection)
    const firstOutgoing = await db.collection('bank_accounts').findOne();

    for (const record of debt) {
      reports.push({
        _id: record._id,
        type: 'debt',
        amount: toNumber(record.amount),
        description: record.description,
        balance: 0, // debt reports didn't have balance, set to 0 for compatibility
        account: firstOutgoing._id, // debt reports didn't have account, set to first outgoing account or null for compatibility
        category: record.linkedTo,
        createdAt: record.createdAt,
        createdBy: record.createdBy,
      });
    }

    if (reports.length > 0) {
      await db.collection('reports_finance').insertMany(reports);
    }

    // remove the new collections (dropping collections also removes their indexes)
    await db.collection('finance_incoming_reports').drop();
    await db.collection('finance_outgoing_reports').drop();
    await db.collection('finance_debt_reports').drop();
  },
};
