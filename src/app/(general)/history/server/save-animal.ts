'use server';

import { MongoServerError, ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';

import { normalizeFormData, type SaveAnimalError } from './normalize-form-data';
import { uploadAnimalMedia } from './upload-animal-media';

type SaveAnimalSuccess = {
  success: true;
  animalId: string;
};

export async function saveAnimal(
  formData: FormData,
): Promise<SaveAnimalSuccess | SaveAnimalError> {
  const user = await getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const normalized = normalizeFormData(formData);

  if (!normalized.success) {
    return normalized;
  }

  const { data } = normalized;
  const now = new Date();
  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);

  let insertedId: ObjectId | null = null;

  try {
    const { insertedId: newAnimalId } = await animalsCollection.insertOne({
      species: data.species,
      name: data.name,
      sex: data.sex,
      status: data.status,
      draft: true,
      createdAt: now,
      createdBy: user.id,
      ...(data.informator ? { informator: new ObjectId(data.informator) } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.chipNumber ? { chipNumber: data.chipNumber } : {}),
      ...(data.birthday ? { birthday: data.birthday } : {}),
    });

    insertedId = newAnimalId;

    const uploadedAssets = data.files.length
      ? await uploadAnimalMedia(data.files, newAnimalId, user.id)
      : [];

    if (uploadedAssets.length) {
      const [primaryAsset] = uploadedAssets;
      const updatePayload: Partial<AnimalDocument> = {};

      if (primaryAsset) {
        updatePayload.mainAsset = primaryAsset;
      }

      await animalsCollection.updateOne(
        { _id: newAnimalId },
        {
          $set: updatePayload,
        },
      );
    }

    return {
      success: true,
      animalId: newAnimalId.toHexString(),
    };
  } catch (error) {
    if (insertedId) {
      await animalsCollection.deleteOne({ _id: insertedId });
    }

    if (error instanceof MongoServerError && error.code === 11000) {
      return { success: false, error: 'Chip ID already exists.' };
    }

    const errInfo =
      error && typeof error === 'object' && 'errInfo' in error
        ? JSON.stringify(
            (error as { errInfo?: { details?: { schemaRulesNotSatisfied?: unknown } } }).errInfo
              ?.details?.schemaRulesNotSatisfied,
          )
        : undefined;

    console.error('Failed to save animal', error, errInfo);
    return { success: false, error: 'Unable to save animal right now.' };
  }
}
