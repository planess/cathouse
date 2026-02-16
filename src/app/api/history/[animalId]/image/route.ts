import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';
import type { MediaAsset } from '@app/models/media-asset';

import { uploadAnimalMedia } from '../../../../(general)/history/server/upload-animal-media';

const MAX_IMAGE_BYTES = 5.5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg']);
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

type SerializedMediaAsset = Omit<MediaAsset, 'uploadedAt'> & {
  uploadedAt: string;
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ animalId: string }> },
) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: 'Sign in to replace animal images.',
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

  const animalObjectId = new ObjectId(animalId);
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
        message: 'You cannot update animal images.',
      },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Image file is required.',
      },
      { status: 400 },
    );
  }

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
        message: 'Image must not exceed 5.5MB.',
      },
      { status: 413 },
    );
  }

  try {
    const [asset] = await uploadAnimalMedia([file], animalObjectId, user.id);

    if (typeof asset === 'undefined') {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'UPLOAD_FAILED',
          message: 'Image upload failed.',
        },
        { status: 500 },
      );
    }

    await animalsCollection.updateOne(
      { _id: animalObjectId },
      { $set: { mainAsset: asset } },
    );

    // eslint-disable-next-line no-console
    console.log(
      `[PUT /api/history/${animalId}/image] Saved ${asset.originalName} (${asset.size} bytes)`,
    );

    const serializedAsset: SerializedMediaAsset = {
      ...asset,
      uploadedAt: asset.uploadedAt?.toISOString() ?? new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      asset: serializedAsset,
      name: asset.originalName,
      size: asset.size,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[PUT /api/history/${animalId}/image] Unable to save image`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        errorCode: 'UPLOAD_FAILED',
        message: 'Unable to replace image right now.',
      },
      { status: 500 },
    );
  }
}
