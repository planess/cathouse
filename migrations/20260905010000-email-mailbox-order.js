const COLLECTION_NAME = 'email_mailboxes';

async function getCollectionSchema(db) {
  const [collectionInfo] = await db
    .listCollections({ name: COLLECTION_NAME }, { nameOnly: false })
    .toArray();

  if (!collectionInfo?.options?.validator?.$jsonSchema) {
    throw new Error(`Collection "${COLLECTION_NAME}" has no JSON schema.`);
  }

  return collectionInfo.options.validator.$jsonSchema;
}

async function setOrderSchema(db, shouldIncludeOrder) {
  const schema = await getCollectionSchema(db);
  const required = Array.isArray(schema.required) ? schema.required : [];
  const properties = { ...schema.properties };

  if (shouldIncludeOrder) {
    properties.order = {
      bsonType: 'int',
      description: 'Position in the user-defined mailbox list',
    };
  } else {
    delete properties.order;
  }

  await db.command({
    collMod: COLLECTION_NAME,
    validator: {
      $jsonSchema: {
        ...schema,
        required: shouldIncludeOrder
          ? [...new Set([...required, 'order'])]
          : required.filter((field) => field !== 'order'),
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
    const mailboxes = await db
      .collection(COLLECTION_NAME)
      .find({}, { projection: { _id: 1 } })
      .sort({ normalizedAddress: 1 })
      .toArray();

    if (mailboxes.length > 0) {
      await db.collection(COLLECTION_NAME).bulkWrite(
        mailboxes.map(({ _id }, order) => ({
          updateOne: {
            filter: { _id },
            update: { $set: { order } },
          },
        })),
      );
    }

    return setOrderSchema(db, true);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await setOrderSchema(db, false);
    await db
      .collection(COLLECTION_NAME)
      .updateMany({}, { $unset: { order: '' } });
  },
};
