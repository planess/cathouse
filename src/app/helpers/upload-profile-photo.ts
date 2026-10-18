import type { ProfilePhotoUploadResponse } from '@app/models/profile-photo-upload-response';
import type { ProfilePhotoUploadTarget } from '@app/models/profile-photo-upload-target';

/**
 * Uploads a profile photo from the browser straight to R2: requests a
 * presigned URL from `{endpoint}/upload-url`, `PUT`s the file to it, then
 * attaches the uploaded file to the profile with `PUT {endpoint}`.
 *
 * @param endpoint - Photo API of the profile, e.g. `/api/profile/photo`.
 * @param file - Photo selected by the user.
 * @returns Whether the photo was saved, with a failure reason otherwise.
 */
export async function uploadProfilePhoto(
  endpoint: string,
  file: File,
): Promise<ProfilePhotoUploadResponse> {
  try {
    const targetResponse = await fetch(`${endpoint}/upload-url`, {
      body: JSON.stringify({ type: file.type, size: file.size }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const target = (await targetResponse.json()) as ProfilePhotoUploadTarget;

    if (!target.success || !target.key || !target.url) {
      return { success: false, error: target.error ?? 'common' };
    }

    const uploadResponse = await fetch(target.url, {
      body: file,
      headers: target.headers,
      method: 'PUT',
    });

    if (!uploadResponse.ok) {
      return { success: false, error: 'common' };
    }

    const attachResponse = await fetch(endpoint, {
      body: JSON.stringify({ key: target.key }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    return (await attachResponse.json()) as ProfilePhotoUploadResponse;
  } catch {
    return { success: false, error: 'common' };
  }
}
