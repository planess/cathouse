/** One file a client wants to upload to media storage. */
export interface MediaUploadRequest {
  /** Requested storage path, normally `<folder>/YYMMDD-<original name>`. */
  path: string;
  /**
   * File name from the uploader's device. When present, the upload is checked
   * against the target folder for duplicates and name clashes; when absent
   * (for example a folder marker), the path is signed as is.
   */
  originalName?: string;
  /** File size in bytes, when the client knows it; needed to detect duplicates. */
  size?: number;
}
