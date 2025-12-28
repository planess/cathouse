module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // transfer value from 'userID' into '_id' in 'profiles' collection
    const cursor = db.collection('profiles').aggregate([
      { $addFields: { _id: { $ifNull: ['$userID', '_id'] } } },
      { $unset: 'userID' },
      {
        $merge: {
          into: 'profiles-modern',
          whenMatched: 'fail',
          whenNotMatched: 'insert',
        },
      },
    ]);

    // consume cursor to execute server-side merge
    while (await cursor.hasNext()) {
      await cursor.next();
    }

    // verify counts inside the transaction
    const countOld = await db.collection('profiles').countDocuments({});
    const countNew = await db.collection('profiles-modern').countDocuments({});

    if (countOld !== countNew) {
      throw new Error(
        `Migration failed: document count mismatch (old: ${countOld}, new: ${countNew})`,
      );
    }

    await db
      .collection('profiles-modern')
      .rename('profiles', { dropTarget: true });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db
      .collection('profiles')
      .updateMany({ userID: { $exists: false } }, [
        { $set: { userID: '$_id' } },
      ]);
  },
};
