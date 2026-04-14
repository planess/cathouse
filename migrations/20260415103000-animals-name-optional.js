const ANIMALS_COLLECTION = 'animals';
const TEMP_COLLECTION = 'animals_name_optional_tmp';
const REQUIRED_FIELDS = ['species', 'sex'];
const DOWN_FALLBACK_NAME = 'No name yet';
const BATCH_SIZE = 1000;

async function dropCollectionIfExists(db, collectionName) {
  const [collectionInfo] = await db
    .listCollections({ name: collectionName }, { nameOnly: true })
    .toArray();

  if (collectionInfo) {
    await db.collection(collectionName).drop();
  }
}

function buildRequiredFields(currentRequired, shouldRequireName) {
  const nextRequired = new Set(currentRequired);

  if (shouldRequireName) {
    nextRequired.add('name');
  } else {
    nextRequired.delete('name');
  }

  for (const field of REQUIRED_FIELDS) {
    nextRequired.add(field);
  }

  return [...nextRequired];
}

async function getAnimalsCollectionOptions(db, shouldRequireName) {
  const [collectionInfo] = await db
    .listCollections({ name: ANIMALS_COLLECTION }, { nameOnly: false })
    .toArray();

  if (!collectionInfo) {
    throw new Error(`Collection "${ANIMALS_COLLECTION}" does not exist.`);
  }

  const validator = collectionInfo.options?.validator;
  const jsonSchema = validator?.$jsonSchema;

  if (!validator || !jsonSchema || typeof jsonSchema !== 'object') {
    throw new Error(
      `Collection "${ANIMALS_COLLECTION}" does not have a compatible $jsonSchema validator.`,
    );
  }

  const currentRequired = Array.isArray(jsonSchema.required)
    ? jsonSchema.required.filter((field) => typeof field === 'string')
    : [];
  const nextRequired = buildRequiredFields(currentRequired, shouldRequireName);

  return {
    validator: {
      ...validator,
      $jsonSchema: {
        ...jsonSchema,
        required: nextRequired,
      },
    },
    validationAction: collectionInfo.options?.validationAction,
    validationLevel: collectionInfo.options?.validationLevel,
  };
}

function normalizeForDownMigration(document) {
  if (typeof document.name === 'string' && document.name.trim().length > 0) {
    return document;
  }

  return {
    ...document,
    name: DOWN_FALLBACK_NAME,
  };
}

async function copyDocuments(
  sourceCollection,
  targetCollection,
  shouldRequireName,
) {
  const cursor = sourceCollection.find();
  const batch = [];

  while (await cursor.hasNext()) {
    const current = await cursor.next();
    if (!current) {
      continue;
    }

    batch.push(
      shouldRequireName ? normalizeForDownMigration(current) : current,
    );

    if (batch.length >= BATCH_SIZE) {
      await targetCollection.insertMany(batch);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    await targetCollection.insertMany(batch);
  }
}

async function copyIndexes(sourceCollection, targetCollection) {
  const indexes = await sourceCollection.indexes();

  for (const index of indexes) {
    if (index.name === '_id_') {
      continue;
    }

    const { key, name, v, ns, ...options } = index;
    await targetCollection.createIndex(key, { ...options, name });
  }
}

async function updateNameRequirement(db, shouldRequireName) {
  const sourceCollection = db.collection(ANIMALS_COLLECTION);
  const collectionOptions = await getAnimalsCollectionOptions(
    db,
    shouldRequireName,
  );

  await dropCollectionIfExists(db, TEMP_COLLECTION);
  await db.createCollection(TEMP_COLLECTION, collectionOptions);

  const targetCollection = db.collection(TEMP_COLLECTION);
  await copyDocuments(sourceCollection, targetCollection, shouldRequireName);
  await copyIndexes(sourceCollection, targetCollection);

  await targetCollection.rename(ANIMALS_COLLECTION, { dropTarget: true });
}

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await updateNameRequirement(db, false);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await updateNameRequirement(db, true);
  },
};
