/**
 * Custom metadata attached to a media file when it is uploaded to cloud storage.
 * The media worker stores every entry as an `x-amz-meta-<key>` header, so all
 * values are ASCII-only strings.
 */
export interface MediaUploadMetadata {
  /** Upload time as an ISO 8601 string; survives renames and moves. */
  'uploaded-at': string;
  /** Identifier of the user who uploaded the file. */
  'uploaded-by': string;
  /** File name chosen on the uploader's device, URI-encoded to stay ASCII. */
  'original-name': string;
}
