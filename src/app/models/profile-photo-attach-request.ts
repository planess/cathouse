/** Body of a request that attaches an uploaded photo to a profile. */
export interface ProfilePhotoAttachRequest {
  /** R2 key returned with the presigned upload URL. */
  key: string;
}
