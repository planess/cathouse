import type { ObjectId } from 'mongodb';

import { updateProfile } from '@app/(personal)/profile/services/update-profile';
import type { ProfilePhotoError } from '@app/models/profile-photo-error';
import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TYPES,
} from '@app/models/profile-photo-limits';

import { getProfilePhotoFolder } from './get-profile-photo-folder';
import { r2Service } from './r2.service';

/**
 * Verifies a photo uploaded straight to R2 and saves its key to the profile.
 * The key must belong to the user's folder; an uploaded file of a wrong type
 * or size is removed from R2.
 *
 * @param userId - Owner of the profile.
 * @param key - R2 key returned with the presigned upload URL.
 * @returns A failure reason, or `null` when the photo was saved.
 */
export async function attachProfilePhoto(
  userId: ObjectId,
  key: unknown,
): Promise<ProfilePhotoError | null> {
  if (
    typeof key !== 'string' ||
    !key.startsWith(getProfilePhotoFolder(userId)) ||
    !/^profiles\/[\da-f]{24}\/[\da-f]{48}\.(png|jpg)$/.test(key)
  ) {
    return 'common';
  }

  const fileInfo = await r2Service.getFileInfo(key);

  if (!fileInfo) {
    return 'common';
  }

  if (!PROFILE_PHOTO_TYPES.includes(fileInfo.contentType)) {
    await r2Service.deleteFile(key);

    return 'type';
  }

  if (fileInfo.size > PROFILE_PHOTO_MAX_BYTES) {
    await r2Service.deleteFile(key);

    return 'size';
  }

  await updateProfile(userId, { profilePhoto: key });

  return null;
}
