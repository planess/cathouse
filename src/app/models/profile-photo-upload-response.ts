import type { ProfilePhotoError } from './profile-photo-error';

/** Response of attaching an uploaded photo to a profile. */
export interface ProfilePhotoUploadResponse {
  /** Whether the photo was verified and saved to the profile. */
  success: boolean;
  /** Reason of a failure. */
  error?: ProfilePhotoError;
}
