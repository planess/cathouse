'use server';

import { revalidatePath } from 'next/cache';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';

import { parseTreatmentFormData } from './treatment-payload';
import { TreatmentPayloadError } from './treatment-payload-error';

import type { TreatmentMutationResponse } from './create-treatment';

export async function updateTreatment(
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

  const indexRaw = formData.get('treatmentIndex')?.toString() ?? '';
  const treatmentIndex = Number.parseInt(indexRaw, 10);

  if (Number.isNaN(treatmentIndex) || treatmentIndex < 0) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Treatment identifier is invalid.',
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

  const vetTreatments = animal.vetTreatments ?? [];

  if (treatmentIndex >= vetTreatments.length) {
    return {
      success: false,
      status: 404,
      errorCode: 'NOT_FOUND',
      message: 'Treatment record was not found.',
    };
  }

  try {
    const result = await animalsCollection.updateOne(
      { _id: parsedPayload.animalId },
      {
        $set: { [`vetTreatments.${treatmentIndex}`]: parsedPayload.treatment },
      },
    );

    if (!result.acknowledged || result.modifiedCount === 0) {
      throw new Error('Update rejected.');
    }
  } catch (error) {
    const errInfo =
      error && typeof error === 'object' && 'errInfo' in error
        ? JSON.stringify((error as { errInfo?: unknown }).errInfo)
        : undefined;

    console.error(
      '[updateTreatment] Unable to update treatment',
      error,
      errInfo,
    );

    return {
      success: false,
      status: 500,
      errorCode: 'UPDATE_FAILED',
      message: 'Unable to update the treatment right now.',
    };
  }

  revalidatePath(`/registry/${parsedPayload.animalId.toHexString()}`);

  return { success: true };
}
