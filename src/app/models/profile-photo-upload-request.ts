/** Body of a request for a presigned profile photo upload URL. */
export interface ProfilePhotoUploadRequest {
  /** MIME type of the photo; must be one of `PROFILE_PHOTO_TYPES`. */
  type: string;
  /** Size of the photo in bytes. */
  size: number;
}
