import { randomBytes } from 'node:crypto';

import type { ObjectId } from 'mongodb';

import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TYPES,
} from '@app/models/profile-photo-limits';
import type { ProfilePhotoUploadTarget } from '@app/models/profile-photo-upload-target';

import { getProfilePhotoFolder } from './get-profile-photo-folder';
import { signR2Upload } from './sign-r2-upload';

/** File extension stored for every accepted photo MIME type. */
const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

/**
 * Validates a profile photo before upload and issues a presigned R2 URL for it
 * under `profiles/{userId}` with a random name.
 *
 * @param userId - Owner of the profile.
 * @param type - MIME type of the photo.
 * @param size - Size of the photo in bytes.
 * @returns The upload target, or a failure reason.
 */
export async function createProfilePhotoUpload(
  userId: ObjectId,
  type: unknown,
  size: unknown,
): Promise<ProfilePhotoUploadTarget> {
  if (typeof type !== 'string' || !PROFILE_PHOTO_TYPES.includes(type)) {
    return { success: false, error: 'type' };
  }

  if (
    typeof size !== 'number' ||
    !Number.isInteger(size) ||
    size <= 0 ||
    size > PROFILE_PHOTO_MAX_BYTES
  ) {
    return { success: false, error: 'size' };
  }

  const key = `${getProfilePhotoFolder(userId)}${randomBytes(24).toString('hex')}.${EXTENSION_BY_TYPE[type]}`;
  const { url, headers } = await signR2Upload(key, type);

  return { success: true, key, url, headers };
}
