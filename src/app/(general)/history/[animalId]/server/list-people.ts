'use server';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { InformatorOption } from '../types';
import type { ObjectId } from 'mongodb';

interface PersonDocument {
  _id: ObjectId;
  name?: string;
}

const DEFAULT_LIMIT = 100;

export async function listInformatorOptions(
  limit = DEFAULT_LIMIT,
): Promise<InformatorOption[]> {
  const client = await clientPromise;
  const db = client.db();
  const peopleCollection = db.collection<PersonDocument>(DbTables.people);

  const people = await peopleCollection
    .find({}, { projection: { name: 1 } })
    .sort({ name: 1 })
    .limit(limit)
    .toArray();

  return people
    .filter((person) => Boolean(person.name?.trim()))
    .map((person) => ({
      value: person._id.toString(),
      label: person.name!.trim(),
    }));
}
