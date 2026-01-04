'use server';

import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import {
  parseTreatmentFormData,
} from './treatment-payload';
import type { TreatmentMutationResponse } from './create-treatment';
import { TreatmentPayloadError } from './treatment-payload-error';

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

  const hasHistoryAccess = await hasPermission(
    SYSTEM_PERMISSIONS.HISTORY_CREATE,
  );

  if (!hasHistoryAccess) {
    return {
      success: false,
      status: 403,
      errorCode: 'FORBIDDEN',
      message: 'You do not have permission to manage treatments.',
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

  const animal = await animalsCollection.findOne({ _id: parsedPayload.animalId });

  if (!animal) {
    return {
      success: false,
      status: 404,
      errorCode: 'NOT_FOUND',
      message: 'Animal record was not found.',
    };
  }

  const isOwner = animal.createdBy?.equals
    ? animal.createdBy.equals(user.id)
    : animal.createdBy?.toString() === user.id.toString();

  if (!isOwner) {
    return {
      success: false,
      status: 403,
      errorCode: 'FORBIDDEN',
      message: 'You do not have access to this record.',
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
      { $set: { [`vetTreatments.${treatmentIndex}`]: parsedPayload.treatment } },
    );

    if (!result.acknowledged || result.modifiedCount === 0) {
      throw new Error('Update rejected.');
    }
  } catch (error) {
    console.error('[updateTreatment] Unable to update treatment', error, JSON.stringify(error.errInfo));

    return {
      success: false,
      status: 500,
      errorCode: 'UPDATE_FAILED',
      message: 'Unable to update the treatment right now.',
    };
  }

  await revalidatePath(`/history/${parsedPayload.animalId.toHexString()}`);

  return { success: true };
}
