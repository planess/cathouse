'use server';

import { revalidatePath } from 'next/cache';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';

import { parseTreatmentFormData } from './treatment-payload';
import { TreatmentPayloadError } from './treatment-payload-error';

export type TreatmentMutationSuccess = {
  success: true;
};

export type TreatmentMutationError = {
  success: false;
  status: number;
  errorCode:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'INVALID_INPUT'
    | 'NOT_FOUND'
    | 'INVALID_STATE'
    | 'UPDATE_FAILED';
  message: string;
};

export type TreatmentMutationResponse =
  | TreatmentMutationSuccess
  | TreatmentMutationError;

export async function createTreatment(
  formData: FormData,
): Promise<TreatmentMutationResponse> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'Sign in to manage treatments.',
    };
  }

  let parsedPayload;

  try {
    parsedPayload = parseTreatmentFormData(formData);
  } catch (error) {
    const message =
      error instanceof TreatmentPayloadError
        ? error.message
        : 'Invalid payload.';

    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message,
    };
  }

  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);

  const animal = await animalsCollection.findOne({
    _id: parsedPayload.animalId,
  });

  if (!animal) {
    return {
      success: false,
      status: 404,
      errorCode: 'NOT_FOUND',
      message: 'Animal record was not found.',
    };
  }

  const hasHistoryAccess = await editHistoryGranted(animal.createdBy);

  if (!hasHistoryAccess) {
    return {
      success: false,
      status: 403,
      errorCode: 'FORBIDDEN',
      message: 'You do not have permission to manage treatments.',
    };
  }

  const hasOpenTreatment = animal.vetTreatments?.some(
    (record) => !record.endDate,
  );

  if (hasOpenTreatment) {
    return {
      success: false,
      status: 409,
      errorCode: 'INVALID_STATE',
      message: 'Finish the current treatment before adding a new one.',
    };
  }

  try {
    const result = await animalsCollection.updateOne(
      { _id: parsedPayload.animalId },
      { $push: { vetTreatments: parsedPayload.treatment } },
    );

    if (!result.acknowledged || result.modifiedCount === 0) {
      throw new Error('Update rejected.');
    }
  } catch (error) {
    console.error('[createTreatment] Unable to save treatment', error);

    return {
      success: false,
      status: 500,
      errorCode: 'UPDATE_FAILED',
      message: 'Unable to save the treatment right now.',
    };
  }

  await revalidatePath(`/history/${parsedPayload.animalId.toHexString()}`);

  return { success: true };
}
