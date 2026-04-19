const { Decimal128 } = require('mongodb');

module.exports = {
  async up(db, client) {
    // Some deployments don't allow `collMod`. We'll create a new collection
    // `bank_accounts_new`, copy documents converting `balance` to Decimal128,
    // then atomically replace the original collection by renaming.

    // Desired validator for the new collection
    const validator = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'iban', 'balance', 'isActive', 'createdAt'],
        properties: {
          name: { bsonType: 'string', description: 'Name of the bank account' },
          iban: { bsonType: 'string', description: 'IBAN of the bank account' },
          balance: {
            bsonType: 'decimal',
            description: 'Balance of the bank account',
          },
          isActive: {
            bsonType: 'bool',
            description: 'Whether the bank account is active',
          },
          createdAt: { bsonType: 'date', description: 'Date of creation' },
        },
      },
    };

    // If target already exists from a previous failed run, remove it first
    const newName = 'bank_accounts_new';

    await db.createCollection(newName, { validator });

    // Copy documents in batches, converting `balance` to Decimal128 when needed
    const cursor = db.collection('bank_accounts').find();
    const batch = [];
    const BATCH_SIZE = 1000;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const copy = { ...doc };

      if (copy.balance !== null) {
        // If already Decimal128, leave as is; if number or string, convert
        if (copy.balance && copy.balance._bsontype === 'Decimal128') {
          // keep
        } else if (typeof copy.balance === 'number') {
          copy.balance = Decimal128.fromString(copy.balance.toString());
        } else {
          try {
            copy.balance = Decimal128.fromString(String(copy.balance));
          } catch (error) {
            const id = copy && copy._id ? String(copy._id) : '[unknown id]';

            throw new Error(
              `Failed to convert balance to Decimal128 for document ${id}: ${error && error.message ? error.message : error}`,
            );
          }
        }
      }

      batch.push(copy);

      if (batch.length >= BATCH_SIZE) {
        await db.collection(newName).insertMany(batch);

        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await db.collection(newName).insertMany(batch);
    }

    // Atomically replace the original collection by renaming the new one
    // to the original name. Use `dropTarget: true` to overwrite.
    await db.collection(newName).rename('bank_accounts', { dropTarget: true });
  },

  async down(db, client) {
    // rollback: try to restore previous structure by converting balance
    // back to double if needed. We will create `bank_accounts_old_new`, copy
    // documents converting `balance` to Number when possible, then rename back.
    const newName = 'bank_accounts_old_new';
    const source = 'bank_accounts';

    await db.createCollection(newName);

    const cursor = db.collection(source).find();
    const batch = [];
    const BATCH_SIZE = 1000;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const copy = { ...doc };

      if (copy.balance !== null && copy.balance._bsontype === 'Decimal128') {
        try {
          const num = Number.parseFloat(copy.balance.toString());
          if (!Number.isFinite(num)) {
            const id = copy && copy._id ? String(copy._id) : '[unknown id]';
            throw new Error(
              `Parsed balance is not a finite number for document ${id}`,
            );
          }
          copy.balance = num;
        } catch (error) {
          const id = copy && copy._id ? String(copy._id) : '[unknown id]';
          throw new Error(
            `Failed to convert Decimal128 balance to number for document ${id}: ${error && error.message ? error.message : error}`,
          );
        }
      }
      batch.push(copy);

      if (batch.length >= BATCH_SIZE) {
        await db.collection(newName).insertMany(batch);

        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await db.collection(newName).insertMany(batch);
    }

    // Replace current `bank_accounts` with the restored collection
    await db.collection(newName).rename(source, { dropTarget: true });
  },
};
