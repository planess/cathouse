/** A file stored directly in a media storage folder. */
export interface MediaFolderFile {
  /** File name without the folder. */
  name: string;
  /** Full storage path. */
  path: string;
  /** File size in bytes. */
  size: number;
}
