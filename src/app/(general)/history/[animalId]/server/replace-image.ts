'use server';

import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';
import type { MediaAsset } from '@app/models/media-asset';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import { uploadAnimalMedia } from '../../server/upload-animal-media';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg']);
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

type ReplaceImageSuccess = {
  success: true;
  asset: MediaAsset;
  name: string;
  size: number;
};

type ReplaceImageError = {
  success: false;
  status: number;
  errorCode:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'INVALID_INPUT'
    | 'UNSUPPORTED_FORMAT'
    | 'FILE_TOO_LARGE'
    | 'UPLOAD_FAILED';
  message: string;
};

export type ReplaceImageResponse = ReplaceImageSuccess | ReplaceImageError;

export async function replaceImage(
  formData: FormData,
): Promise<ReplaceImageResponse> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'Sign in to replace animal images.',
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
      message: 'You cannot update animal images.',
    };
  }

  const animalIdValue = formData.get('animalId');

  if (typeof animalIdValue !== 'string' || !ObjectId.isValid(animalIdValue)) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Animal identifier is invalid.',
    };
  }

  const file = formData.get('file');

  if (!(file instanceof File)) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: 'Image file is required.',
    };
  }

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
      message: 'Image must not exceed 5MB.',
    };
  }

  const animalObjectId = new ObjectId(animalIdValue);
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

  try {
    const [asset] = await uploadAnimalMedia([file], animalObjectId, user.id);

    if (!asset) {
      return {
        success: false,
        status: 500,
        errorCode: 'UPLOAD_FAILED',
        message: 'Image upload failed.',
      };
    }

    await animalsCollection.updateOne(
      { _id: animalObjectId },
      { $set: { mainAsset: asset } },
    );

    console.log(
      `[replaceImage] Saved ${asset.originalName} (${asset.size} bytes) for animal ${animalObjectId.toHexString()}`,
    );

    return {
      success: true,
      asset,
      name: asset.originalName,
      size: asset.size,
    };
  } catch (error) {
    console.error(
      `[replaceImage] Unable to save image for animal ${animalObjectId.toHexString()}`,
      error,
    );

    return {
      success: false,
      status: 500,
      errorCode: 'UPLOAD_FAILED',
      message: 'Unable to replace image right now.',
    };
  }
}
