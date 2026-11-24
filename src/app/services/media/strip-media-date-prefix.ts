/** Leading `YYMMDD-` date prefix added to uploaded media file names. */
const MEDIA_DATE_PREFIX_PATTERN = /^\d{6}-/;

/**
 * Removes one leading `YYMMDD-` date prefix from a media file name.
 *
 * @param fileName - Stored file name, with or without a date prefix.
 * @returns The name without the prefix, or the name unchanged when it has none.
 */
export function stripMediaDatePrefix(fileName: string): string {
  return fileName.replace(MEDIA_DATE_PREFIX_PATTERN, '');
}
