/** Presigned R2 upload issued by the media worker's `/sign-r2` route. */
export interface SignedR2Upload {
  /** R2 key the file is uploaded to. */
  path: string;
  /** Presigned URL to `PUT` the file to. */
  url: string;
  /** Headers the `PUT` request must send. */
  headers: Record<string, string>;
}
