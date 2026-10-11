const COLLECTION_NAME = 'profiles';

async function setSchema(db, extend = true) {
  const [collectionInfo] = await db
    .listCollections({ name: COLLECTION_NAME }, { nameOnly: false })
    .toArray();
  const schema = collectionInfo.options.validator.$jsonSchema;
  // const required = schema.required || [];
  const properties = { ...schema.properties };

  if (extend) {
    properties.phone = {
      bsonType: 'string',
      description: 'Phone number of the user',
    };
  } else {
    delete properties.phone;
  }

  await db.command({
    collMod: COLLECTION_NAME,
    validator: {
      $jsonSchema: {
        ...schema,
        // required, // has no required fields
        properties,
      },
    },
  });
}

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await setSchema(db);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await setSchema(db, false);

    await db.collection(COLLECTION_NAME).updateMany(
      { phone: { $exists: true } },
      { $unset: { phone: '' } }
    );
  },
};
