/** Outcome of an upload request for one file, returned in request order. */
export type MediaUploadResult =
  | {
      /** The file can be uploaded with the signed URL. */
      status: 'upload';
      /** Storage path the file is uploaded to; may carry a random suffix. */
      path: string;
      /** Presigned URL to `PUT` the file to. */
      url: string;
      /** Headers the `PUT` request must send, including upload metadata. */
      headers: Record<string, string>;
    }
  | {
      /** The file is already stored in the target folder and is not uploaded again. */
      status: 'duplicate';
      /** Storage path of the existing file. */
      existingPath: string;
    };
