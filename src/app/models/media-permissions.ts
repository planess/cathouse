/** Permissions available to the current media user. */
export type MediaPermissions = {
  /** Whether the user can access the media area. */
  canAccess: boolean;
  /** Whether the user can delete media files and folders. */
  canDelete: boolean;
  /** Whether the user can review media files. */
  canReview: boolean;
  /** Whether the user can upload, rename, and move media files. */
  canUpload: boolean;
};
