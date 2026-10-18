import type { ObjectId } from 'mongodb';

/**
 * Returns the R2 folder that holds a user's profile photos, with a trailing slash.
 *
 * @param userId - Owner of the profile.
 */
export function getProfilePhotoFolder(userId: ObjectId): string {
  return `profiles/${userId.toString()}/`;
}
