import type { ProfilePhotoError } from './profile-photo-error';

/** Response of a request for a presigned profile photo upload URL. */
export interface ProfilePhotoUploadTarget {
  /** Whether the upload URL was issued. */
  success: boolean;
  /** Reason of a failure. */
  error?: ProfilePhotoError;
  /** R2 key the photo is uploaded to; send it back to attach the photo. */
  key?: string;
  /** Presigned URL to `PUT` the photo to. */
  url?: string;
  /** Headers the `PUT` request must send, such as the signed `content-type`. */
  headers?: Record<string, string>;
}
