/** Response of `POST /api/profile/photo`. */
export interface ProfilePhotoUploadResponse {
  /** Whether the photo was uploaded and saved to the profile. */
  success: boolean;
  /** Reason of a failure: wrong file type, too large file, or any other error. */
  error?: 'type' | 'size' | 'common';
}
