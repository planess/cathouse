import { randomBytes } from 'node:crypto';

import type { ObjectId } from 'mongodb';

import { r2Service } from './r2.service';

/**
 * Returns the lowercase extension of a file name with unsafe characters removed.
 *
 * @param fileName - Original file name.
 */
function getSafeFileExtension(fileName: string): string {
  const parts = fileName.trim().toLowerCase().split('.');

  if (parts.length < 2) {
    return '';
  }

  const extension = parts.at(-1) ?? '';

  return extension.replaceAll(/[^\da-z]+/g, '');
}

/**
 * Uploads a profile photo to R2 under `profiles/{userId}` with a random name.
 *
 * @param userId - Owner of the profile.
 * @param file - Photo to upload; nothing is uploaded for a missing or empty file.
 * @returns R2 key of the uploaded photo, or `null` when nothing was uploaded.
 */
export async function uploadProfilePhoto(
  userId: ObjectId,
  file?: File | null,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const extension = getSafeFileExtension(file.name);
  const generatedHashName = randomBytes(24).toString('hex');
  const fileName = extension
    ? `${generatedHashName}.${extension}`
    : generatedHashName;
  const [uploadedPhoto] = await r2Service.uploadFiles([file], {
    folder: `profiles/${userId.toString()}`,
    fileName,
    metadata: {
      profileId: userId.toString(),
    },
  });

  return uploadedPhoto?.key ?? null;
}
