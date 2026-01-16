'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument, AnimalObservation } from '@app/models/animal';
import type { MediaAsset } from '@app/models/media-asset';

import { uploadAnimalMedia } from '../../server/upload-animal-media';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ASSETS = 5;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg']);
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const payloadSchema = z.object({
  animalId: z
    .string()
    .trim()
    .refine((value) => ObjectId.isValid(value), {
      message: 'Animal identifier is invalid.',
    }),
  note: z
    .string()
    .optional()
    .transform((value) => (value ? value.trim() : undefined)),
  informator: z
    .string()
    .optional()
    .transform((value) => (value ? value.trim() : undefined)),
  health: z
    .string()
    .optional()
    .transform((value) => {
      const parsed = Number.parseInt(value ?? '', 10);

      if (Number.isNaN(parsed)) {
        return 5;
      }

      return Math.min(Math.max(parsed, 1), 10);
    }),
  locationLatitude: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseFloat(value) : undefined)),
  locationLongitude: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseFloat(value) : undefined)),
  locationAddress: z
    .string()
    .optional()
    .transform((value) => (value ? value.trim() : undefined)),
});

type Payload = z.infer<typeof payloadSchema>;

type SerializedMediaAsset = Omit<MediaAsset, 'uploadedAt'> & {
  uploadedAt: string;
};

export type SerializedObservation = {
  date: string;
  note?: string;
  location?: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  assets?: SerializedMediaAsset[];
  informator?: string;
  health?: number;
  createdBy: string;
  createdAt: string;
};

type CreateObservationSuccess = {
  success: true;
  observation: SerializedObservation;
};

type CreateObservationError = {
  success: false;
  status: number;
  errorCode:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'INVALID_INPUT'
    | 'NOT_FOUND'
    | 'UNSUPPORTED_FORMAT'
    | 'FILE_TOO_LARGE'
    | 'UPDATE_FAILED'
    | 'UPLOAD_FAILED';
  message: string;
};

export type CreateObservationResponse =
  | CreateObservationSuccess
  | CreateObservationError;

export async function createObservation(
  formData: FormData,
): Promise<CreateObservationResponse> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'Sign in to add observations.',
    };
  }

  const rawPayload = {
    animalId: formData.get('animalId')?.toString() ?? '',
    note: formData.get('note')?.toString(),
    informator: formData.get('informator')?.toString(),
    health: formData.get('health')?.toString(),
    locationLatitude: formData.get('locationLatitude')?.toString(),
    locationLongitude: formData.get('locationLongitude')?.toString(),
    locationAddress: formData.get('locationAddress')?.toString(),
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
    note,
    informator,
    health,
    locationLatitude,
    locationLongitude,
    locationAddress,
  } = parsedPayload.data;

  if (informator && !ObjectId.isValid(informator)) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Informator identifier is invalid.',
    };
  }

  if (
    (typeof locationLatitude !== 'undefined' &&
      Number.isNaN(locationLatitude)) ||
    (typeof locationLongitude !== 'undefined' &&
      Number.isNaN(locationLongitude))
  ) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Location coordinates are invalid.',
    };
  }

  const animalObjectId = new ObjectId(animalId);
  const informatorId = informator ? new ObjectId(informator) : undefined;

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
      message: 'You do not have permission to add observations.',
    };
  }

  const files = formData
    .getAll('assets')
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length > MAX_ASSETS) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: `Attach up to ${MAX_ASSETS} images per observation.`,
    };
  }

  for (const file of files) {
    const normalizedMime = (file.type || '').toLowerCase();
    const normalizedName = file.name.toLowerCase();
    const isMimeAllowed = ALLOWED_MIME_TYPES.has(normalizedMime);
    const isExtensionAllowed = [...ALLOWED_EXTENSIONS].some((extension) =>
      normalizedName.endsWith(extension),
    );

    if (!isMimeAllowed && !isExtensionAllowed) {
      return {
        success: false,
        status: 415,
        errorCode: 'UNSUPPORTED_FORMAT',
        message: 'Only PNG and JPG images are allowed.',
      };
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return {
        success: false,
        status: 413,
        errorCode: 'FILE_TOO_LARGE',
        message: 'Each image must not exceed 5MB.',
      };
    }
  }

  if (!note && files.length === 0 && !locationLatitude && !locationLongitude) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Provide a note, images, or a map location.',
    };
  }

  if (
    (typeof locationLatitude !== 'undefined' ||
      typeof locationLongitude !== 'undefined') &&
    (!locationAddress ||
      typeof locationLatitude === 'undefined' ||
      typeof locationLongitude === 'undefined')
  ) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message:
        'Address and both coordinates are required when location is provided.',
    };
  }

  let assets: MediaAsset[] | undefined;

  if (files.length > 0) {
    try {
      assets = await uploadAnimalMedia(files, animalObjectId, user.id);
    } catch (error) {
      console.error(
        `[createObservation] Unable to upload assets for ${animalObjectId.toHexString()}`,
        error,
      );

      return {
        success: false,
        status: 500,
        errorCode: 'UPLOAD_FAILED',
        message: 'Unable to upload images right now.',
      };
    }
  }

  const now = new Date();
  const observation: AnimalObservation = {
    date: now,
    health,
    createdBy: user.id,
    createdAt: now,
  };

  if (note) {
    observation.note = note;
  }

  if (assets?.length) {
    observation.assets = assets;
  }

  if (informatorId) {
    observation.informator = informatorId;
  }

  if (
    typeof locationLatitude !== 'undefined' &&
    typeof locationLongitude !== 'undefined' &&
    locationAddress
  ) {
    observation.location = {
      address: locationAddress,
      coordinates: {
        latitude: locationLatitude,
        longitude: locationLongitude,
      },
    };
  }

  let updateResult;
  try {
    updateResult = await animalsCollection.updateOne(
      { _id: animalObjectId },
      {
        $push: {
          observations: observation,
        },
      },
    );
  } catch (error) {
    const errInfo =
      error && typeof error === 'object' && 'errInfo' in error
        ? JSON.stringify((error as { errInfo?: unknown }).errInfo)
        : undefined;

    console.error(
      `[createObservation] Unable to save observation for ${animalObjectId.toHexString()}`,
      errInfo,
      error,
    );

    return {
      success: false,
      status: 500,
      errorCode: 'UPDATE_FAILED',
      message: 'Unable to save observation right now.',
    };
  }

  if (!updateResult.acknowledged || updateResult.modifiedCount === 0) {
    return {
      success: false,
      status: 500,
      errorCode: 'INVALID_INPUT',
      message: 'Unable to save observation right now.',
    };
  }

  await revalidatePath(`/history/${animalObjectId.toHexString()}`);

  return {
    success: true,
    observation: serializeObservation(observation, user.id),
  };
}

function serializeObservation(
  observation: AnimalObservation,
  userId: ObjectId,
): SerializedObservation {
  return {
    date: observation.date?.toISOString() ?? new Date().toISOString(),
    note: observation.note ?? undefined,
    location: observation.location
      ? {
          address: observation.location.address,
          coordinates: {
            latitude: observation.location.coordinates.latitude,
            longitude: observation.location.coordinates.longitude,
          },
        }
      : undefined,
    assets: observation.assets?.map((asset) => ({
      ...asset,
      uploadedAt: asset.uploadedAt?.toISOString() ?? new Date().toISOString(),
    })),
    informator: observation.informator?.toHexString(),
    health: observation.health,
    createdBy: (observation.createdBy ?? userId).toHexString(),
    createdAt: observation.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}
