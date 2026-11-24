/** Decision for one requested upload after checking the target folder. */
export type MediaUploadPlan =
  | {
      /** The file can be uploaded. */
      status: 'upload';
      /** Storage path to upload to; differs from the requested one when a suffix was added. */
      path: string;
    }
  | {
      /** The target folder already holds a file with the same name and size. */
      status: 'duplicate';
      /** Storage path of the file that already exists. */
      existingPath: string;
    };
