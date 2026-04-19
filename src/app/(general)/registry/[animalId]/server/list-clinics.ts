'use server';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import type { ClinicOption } from '../types';
import type { ObjectId } from 'mongodb';

interface ClinicDocument {
  _id: ObjectId;
  name?: string;
  address?: string;
}

const DEFAULT_LIMIT = 200;

export async function listClinicOptions(
  limit = DEFAULT_LIMIT,
): Promise<ClinicOption[]> {
  const client = await clientPromise;
  const db = client.db();
  const clinicsCollection = db.collection<ClinicDocument>(DbTables.clinics);

  const clinics = await clinicsCollection
    .find({}, { projection: { name: 1, address: 1 } })
    .sort({ name: 1 })
    .limit(limit)
    .toArray();

  return clinics
    .filter((clinic) => Boolean(clinic.name?.trim()))
    .map((clinic) => ({
      value: clinic._id.toString(),
      label: clinic.name!.trim(),
      address: clinic.address?.trim(),
    }));
}
