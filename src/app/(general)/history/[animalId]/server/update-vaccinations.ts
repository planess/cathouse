'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';

const MAX_RECORDS_PER_SECTION = 200;

const dateSchema = z
  .string()
  .trim()
  .min(1, 'Provide the vaccination date.')
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), {
    message: 'Vaccination date is invalid.',
  });

const clinicIdSchema = z
  .string()
  .trim()
  .min(1, 'Select the clinic.')
  .refine((value) => ObjectId.isValid(value), {
    message: 'Clinic identifier is invalid.',
  })
  .transform((value) => new ObjectId(value));

const parasiteRecordSchema = z.object({
  name: z.string().trim().min(1, 'Provide the record name.'),
  date: dateSchema,
});

const vaccinationRecordSchema = z.object({
  name: z.string().trim().min(1, 'Provide the vaccine name.'),
  date: dateSchema,
  clinic: clinicIdSchema,
});

const payloadSchema = z.object({
  animalId: z
    .string()
    .trim()
    .refine((value) => ObjectId.isValid(value), {
      message: 'Animal identifier is invalid.',
    }),
  parasites: z.array(parasiteRecordSchema).max(MAX_RECORDS_PER_SECTION),
  rabies: z.array(vaccinationRecordSchema).max(MAX_RECORDS_PER_SECTION),
  virus: z.array(vaccinationRecordSchema).max(MAX_RECORDS_PER_SECTION),
});

type UpdateVaccinationsSuccess = {
  success: true;
};

type UpdateVaccinationsError = {
  success: false;
  status: number;
  errorCode:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'INVALID_INPUT'
    | 'NOT_FOUND'
    | 'UPDATE_FAILED';
  message: string;
};

export type UpdateVaccinationsResponse =
  | UpdateVaccinationsSuccess
  | UpdateVaccinationsError;

function parseJsonArray(value: FormDataEntryValue | null): unknown[] {
  if (!value) {
    return [];
  }

  const raw = value.toString();

  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('Expected array');
    }

    return parsed;
  } catch (error) {
    throw new Error('INVALID_JSON');
  }
}

export async function updateVaccinations(
  formData: FormData,
): Promise<UpdateVaccinationsResponse> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'Sign in to edit the animal.',
    };
  }

  let rawParasites: unknown[] = [];
  let rawRabies: unknown[] = [];
  let rawVirus: unknown[] = [];

  try {
    rawParasites = parseJsonArray(formData.get('parasites'));
    rawRabies = parseJsonArray(formData.get('rabies'));
    rawVirus = parseJsonArray(formData.get('virus'));
  } catch (error) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Invalid payload format.',
    };
  }

  const rawPayload = {
    animalId: formData.get('animalId')?.toString() ?? '',
    parasites: rawParasites,
    rabies: rawRabies,
    virus: rawVirus,
  };

  const parsedPayload = payloadSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: parsedPayload.error.issues[0]?.message ?? 'Invalid payload.',
    };
  }

  const { animalId, parasites, rabies, virus } = parsedPayload.data;
  const animalObjectId = new ObjectId(animalId);

  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);
  const animal = await animalsCollection.findOne({ _id: animalObjectId });

  if (!animal) {
    return {
      success: false,
      status: 404,
      errorCode: 'NOT_FOUND',
      message: 'Animal was not found.',
    };
  }

  const hasHistoryAccess = await editHistoryGranted(animal.createdBy);

  if (!hasHistoryAccess) {
    return {
      success: false,
      status: 403,
      errorCode: 'FORBIDDEN',
      message: 'You do not have permission to edit this animal.',
    };
  }

  const set: Record<string, unknown> = {};
  const unset: Record<string, ''> = {};

  if (parasites.length) {
    set['vetMarkers.parasites'] = parasites;
  } else {
    unset['vetMarkers.parasites'] = '';
  }

  if (rabies.length) {
    set['vetMarkers.rabiesVaccination'] = rabies;
  } else {
    unset['vetMarkers.rabiesVaccination'] = '';
  }

  if (virus.length) {
    set['vetMarkers.virusVaccination'] = virus;
  } else {
    unset['vetMarkers.virusVaccination'] = '';
  }

  try {
    const updateResult = await animalsCollection.updateOne(
      { _id: animalObjectId },
      {
        ...(Object.keys(set).length ? { $set: set } : {}),
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      },
    );

    if (!updateResult.acknowledged) {
      throw new Error('Update failed');
    }
  } catch (error) {
    console.error('[updateVaccinations] Unable to update animal', error);

    return {
      success: false,
      status: 500,
      errorCode: 'UPDATE_FAILED',
      message: 'Unable to save changes right now.',
    };
  }

  await revalidatePath(`/history/${animalObjectId.toHexString()}`);

  return {
    success: true,
  };
}
