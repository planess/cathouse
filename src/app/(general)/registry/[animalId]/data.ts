import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';

export async function loadAnimal(animalId: string) {
  if (!ObjectId.isValid(animalId)) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);

  const query: Record<string, unknown> = {
    _id: new ObjectId(animalId),
  };

  return animalsCollection.findOne(query);
}
