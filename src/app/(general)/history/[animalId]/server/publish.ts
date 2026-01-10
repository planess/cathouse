'use server';

import { ObjectId } from 'mongodb';

import { publishHistoryGranted } from '@app/accessors/publish-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';

export async function publishAnimal(animalId: string) {
  const user = await getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const animalObjectId = new ObjectId(animalId);
  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection(DbTables.animals);
  const animal = await animalsCollection.findOne({ _id: animalObjectId });

  if (!animal) {
    throw new Error('Animal not found');
  } else if (!(await publishHistoryGranted(animal.createdBy))) {
    throw new Error('Forbidden');
  }

  try {
    await animalsCollection.updateOne(
      { _id: animalObjectId },
      { $set: { draft: false } },
    );

    console.log('Animal published successfully');

    return { success: true, animalId };
  } catch (error) {
    console.log('Failed to publish animal', error);

    return {
      success: false,
      status: 500,
      errorCode: 'PUBLISH_FAILED',
      message: 'Failed to publish animal',
    };
  }
}
