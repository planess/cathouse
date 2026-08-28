import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument, AnimalObservation } from '@app/models/animal';
import type { MediaAsset } from '@app/models/media-asset';

import { uploadAnimalMedia } from '../../../../(general)/registry/server/upload-animal-media';

const MAX_IMAGE_BYTES = 5.5 * 1024 * 1024;
const MAX_ASSETS = 5;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg']);
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const payloadSchema = z.object({
  note: z
    .string()
    .optional()
    .transform((value) => {
      if (typeof value === 'undefined' || value.trim().length === 0) {
        return;
      }

      return value.trim();
    }),
  informator: z
    .string()
    .optional()
    .transform((value) => {
      if (typeof value === 'undefined' || value.trim().length === 0) {
        return;
      }

      return value.trim();
    }),
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
    .transform((value) => {
      if (typeof value === 'undefined' || value.length === 0) {
        return;
      }

      return Number.parseFloat(value);
    }),
  locationLongitude: z
    .string()
    .optional()
    .transform((value) => {
      if (typeof value === 'undefined' || value.length === 0) {
        return;
      }

      return Number.parseFloat(value);
    }),
  locationAddress: z
    .string()
    .optional()
    .transform((value) => {
      if (typeof value === 'undefined' || value.trim().length === 0) {
        return;
      }

      return value.trim();
    }),
});

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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ animalId: string }> },
) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: 'Sign in to add observations.',
      },
      { status: 401 },
    );
  }

  const { animalId } = await context.params;

  if (!ObjectId.isValid(animalId)) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Animal identifier is invalid.',
      },
      { status: 400 },
    );
  }

  const formData = await request.formData();

  const rawPayload = {
    note: formData.get('note')?.toString(),
    informator: formData.get('informator')?.toString(),
    health: formData.get('health')?.toString(),
    locationLatitude: formData.get('locationLatitude')?.toString(),
    locationLongitude: formData.get('locationLongitude')?.toString(),
    locationAddress: formData.get('locationAddress')?.toString(),
  };

  const parsedPayload = payloadSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: parsedPayload.error.issues[0]?.message ?? 'Invalid payload.',
      },
      { status: 400 },
    );
  }

  const {
    note,
    informator,
    health,
    locationLatitude,
    locationLongitude,
    locationAddress,
  } = parsedPayload.data;

  if (
    typeof informator !== 'undefined' &&
    informator.length > 0 &&
    !ObjectId.isValid(informator)
  ) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Informator identifier is invalid.',
      },
      { status: 400 },
    );
  }

  if (
    (typeof locationLatitude !== 'undefined' &&
      Number.isNaN(locationLatitude)) ||
    (typeof locationLongitude !== 'undefined' &&
      Number.isNaN(locationLongitude))
  ) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Location coordinates are invalid.',
      },
      { status: 400 },
    );
  }

  const animalObjectId = new ObjectId(animalId);
  const informatorId =
    typeof informator !== 'undefined' && informator.length > 0
      ? new ObjectId(informator)
      : undefined;

  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);
  const animal = await animalsCollection.findOne({ _id: animalObjectId });

  if (!animal) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Animal was not found.',
      },
      { status: 404 },
    );
  }

  const hasHistoryAccess = await editHistoryGranted(animal.createdBy);

  if (!hasHistoryAccess) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'FORBIDDEN',
        message: 'You do not have permission to add observations.',
      },
      { status: 403 },
    );
  }

  const files = formData
    .getAll('assets')
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length > MAX_ASSETS) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: `Attach up to ${MAX_ASSETS} images per observation.`,
      },
      { status: 400 },
    );
  }

  for (const file of files) {
    const normalizedMime = (file.type || '').toLowerCase();
    const normalizedName = file.name.toLowerCase();
    const isMimeAllowed = ALLOWED_MIME_TYPES.has(normalizedMime);
    const isExtensionAllowed = [...ALLOWED_EXTENSIONS].some((extension) =>
      normalizedName.endsWith(extension),
    );

    if (!isMimeAllowed && !isExtensionAllowed) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'UNSUPPORTED_FORMAT',
          message: 'Only PNG and JPG images are allowed.',
        },
        { status: 415 },
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'FILE_TOO_LARGE',
          message: 'Each image must not exceed 5.5MB.',
        },
        { status: 413 },
      );
    }
  }

  if (
    (typeof note === 'undefined' || note.length === 0) &&
    files.length === 0 &&
    typeof locationLatitude === 'undefined' &&
    typeof locationLongitude === 'undefined'
  ) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Provide a note, images, or a map location.',
      },
      { status: 400 },
    );
  }

  if (
    (typeof locationLatitude !== 'undefined' ||
      typeof locationLongitude !== 'undefined') &&
    (typeof locationAddress === 'undefined' ||
      locationAddress.length === 0 ||
      typeof locationLatitude === 'undefined' ||
      typeof locationLongitude === 'undefined')
  ) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message:
          'Address and both coordinates are required when location is provided.',
      },
      { status: 400 },
    );
  }

  let assets: MediaAsset[] | undefined;

  if (files.length > 0) {
    try {
      assets = await uploadAnimalMedia(files, animalObjectId, user.id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `[POST /api/registry/${animalId}/observations] Unable to upload assets`,
        error,
      );

      return NextResponse.json(
        {
          success: false,
          errorCode: 'UPLOAD_FAILED',
          message: 'Unable to upload images right now.',
        },
        { status: 500 },
      );
    }
  }

  const now = new Date();
  const observation: AnimalObservation = {
    date: now,
    health,
    createdBy: user.id,
    createdAt: now,
  };

  if (typeof note !== 'undefined' && note.length > 0) {
    observation.note = note;
  }

  if (typeof assets !== 'undefined' && assets.length > 0) {
    observation.assets = assets;
  }

  if (informatorId) {
    observation.informator = informatorId;
  }

  if (
    typeof locationLatitude !== 'undefined' &&
    typeof locationLongitude !== 'undefined' &&
    typeof locationAddress !== 'undefined' &&
    locationAddress.length > 0
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
      typeof error === 'object' && error !== null && 'errInfo' in error
        ? JSON.stringify((error as { errInfo?: unknown }).errInfo)
        : undefined;

    // eslint-disable-next-line no-console
    console.error(
      `[POST /api/registry/${animalId}/observations] Unable to save observation`,
      errInfo,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        errorCode: 'UPDATE_FAILED',
        message: 'Unable to save observation right now.',
      },
      { status: 500 },
    );
  }

  if (!updateResult.acknowledged || updateResult.modifiedCount === 0) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Unable to save observation right now.',
      },
      { status: 500 },
    );
  }

  revalidatePath(`/registry/${animalObjectId.toHexString()}`);

  const serialized = serializeObservation(observation, user.id);

  return NextResponse.json({
    success: true,
    observation: serialized,
  });
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
