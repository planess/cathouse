'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';
import { AnimalStatus } from '@app/models/animal';

const payloadSchema = z.object({
  animalId: z
    .string()
    .trim()
    .refine((value) => ObjectId.isValid(value), {
      message: 'Animal identifier is invalid.',
    }),
  name: z
    .string({ required_error: 'Provide the animal name.' })
    .trim()
    .min(2, 'Provide the animal name.')
    .max(120, 'Name is too long.'),
  birthday: z
    .string()
    .optional()
    .transform((value) => value?.trim())
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), {
      message: 'Birthday date is invalid.',
    }),
  description: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  passportCode: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  chipNumber: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  informator: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  status: z.nativeEnum(AnimalStatus, {
    required_error: 'Select the animal status.',
    invalid_type_error: 'Select the animal status.',
  }),
  sterilizedEnabled: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  sterilizedDate: z
    .string()
    .optional()
    .transform((value) => value?.trim())
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), {
      message: 'Sterilization date is invalid.',
    }),
  sterilizedMethod: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
  sterilizedClinic: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
});

type Payload = z.infer<typeof payloadSchema>;

type UpdateAnimalInfoSuccess = {
  success: true;
};

type UpdateAnimalInfoError = {
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

export type UpdateAnimalInfoResponse =
  | UpdateAnimalInfoSuccess
  | UpdateAnimalInfoError;

export async function updateAnimalInfo(
  formData: FormData,
): Promise<UpdateAnimalInfoResponse> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'Sign in to edit the animal.',
    };
  }

  const rawPayload: Payload = {
    animalId: formData.get('animalId')?.toString() ?? '',
    name: formData.get('name')?.toString() ?? '',
    birthday: formData.get('birthday')?.toString(),
    description: formData.get('description')?.toString(),
    passportCode: formData.get('passportCode')?.toString(),
    chipNumber: formData.get('chipNumber')?.toString(),
    informator: formData.get('informator')?.toString(),
    status: formData.get('status')?.toString() as AnimalStatus,
    sterilizedEnabled: formData.get('sterilizedEnabled')?.toString(),
    sterilizedDate: formData.get('sterilizedDate')?.toString(),
    sterilizedMethod: formData.get('sterilizedMethod')?.toString(),
    sterilizedClinic: formData.get('sterilizedClinic')?.toString(),
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

  const {
    animalId,
    name,
    birthday,
    description,
    passportCode,
    chipNumber,
    informator,
    status,
    sterilizedEnabled,
    sterilizedDate,
    sterilizedMethod,
    sterilizedClinic,
  } = parsedPayload.data;

  if (sterilizedEnabled && !sterilizedDate) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Provide the sterilization date.',
    };
  }

  const animalObjectId = new ObjectId(animalId);

  let informatorId: ObjectId | undefined;
  if (informator) {
    if (!ObjectId.isValid(informator)) {
      return {
        success: false,
        status: 400,
        errorCode: 'INVALID_INPUT',
        message: 'Informator identifier is invalid.',
      };
    }

    informatorId = new ObjectId(informator);
  }

  let clinicId: ObjectId | undefined;
  if (sterilizedClinic) {
    if (!ObjectId.isValid(sterilizedClinic)) {
      return {
        success: false,
        status: 400,
        errorCode: 'INVALID_INPUT',
        message: 'Clinic identifier is invalid.',
      };
    }

    clinicId = new ObjectId(sterilizedClinic);
  }

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

  const set: Record<string, unknown> = {
    name,
    status,
  };
  const unset: Record<string, ''> = {};

  if (birthday) {
    set.birthday = birthday;
  } else {
    unset.birthday = '';
  }

  if (typeof description !== 'undefined') {
    set.description = description;
  } else {
    unset.description = '';
  }

  if (typeof passportCode !== 'undefined') {
    set.passportCode = passportCode;
  } else {
    unset.passportCode = '';
  }

  if (typeof chipNumber !== 'undefined') {
    set.chipNumber = chipNumber;
  } else {
    unset.chipNumber = '';
  }

  if (informatorId) {
    set.informator = informatorId;
  } else {
    unset.informator = '';
  }

  if (sterilizedEnabled && sterilizedDate) {
    set['vetMarkers.sterilized'] = {
      date: sterilizedDate,
      ...(sterilizedMethod ? { method: sterilizedMethod } : {}),
      ...(clinicId ? { clinic: clinicId } : {}),
    };
  } else {
    unset['vetMarkers.sterilized'] = '';
  }

  try {
    const updateResult = await animalsCollection.updateOne(
      { _id: animalObjectId },
      {
        $set: set,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      },
    );

    if (!updateResult.acknowledged || updateResult.modifiedCount === 0) {
      return {
        success: false,
        status: 500,
        errorCode: 'UPDATE_FAILED',
        message: 'Unable to save changes right now.',
      };
    }
  } catch (error) {
    console.error('[updateAnimalInfo] Unable to update animal', error);

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
