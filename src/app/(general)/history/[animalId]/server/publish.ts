'use server';

import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

export async function publishAnimal(animalId: ObjectId) {
  const user = await getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const hasHistoryAccess = await hasPermission(
    SYSTEM_PERMISSIONS.HISTORY_CREATE,
  );

  if (!hasHistoryAccess) {
    throw new Error('Forbidden');
  }

  const animalObjectId = new ObjectId(animalId);
  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection(DbTables.animals);
  const animal = await animalsCollection.findOne({ _id: animalObjectId });

  if (!animal) {
    throw new Error('Animal not found');
  }

  const isOwner = animal.createdBy?.equals
    ? animal.createdBy.equals(user.id)
    : animal.createdBy?.toString() === user.id.toString();

  if (!isOwner) {
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
