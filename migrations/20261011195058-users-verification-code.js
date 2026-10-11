const COLLECTION_NAME = 'users';

async function setSchema(db, extend = true) {
  const [collectionInfo] = await db
    .listCollections({ name: COLLECTION_NAME }, { nameOnly: false })
    .toArray();
  const schema = collectionInfo.options.validator.$jsonSchema;
  const required = schema.required || [];
  const properties = { ...schema.properties };

  if (extend) {
    properties.emailVerificationCode = {
      bsonType: 'string',
      description: 'Email verification code of the user',
    };
    properties.emailVerificationSentAt = {
      bsonType: 'date',
      description: 'Date when the email verification code was sent',
    };
  } else {
    delete properties.emailVerificationCode;
    delete properties.emailVerificationSentAt;
  }

  await db.command({
    collMod: COLLECTION_NAME,
    validator: {
      $jsonSchema: {
        ...schema,
        required,
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
      { emailVerificationCode: { $exists: true } },
      { $unset: { emailVerificationCode: '' } }
    );
    await db.collection(COLLECTION_NAME).updateMany(
      { emailVerificationSentAt: { $exists: true } },
      { $unset: { emailVerificationSentAt: '' } }
    );
  }
};
