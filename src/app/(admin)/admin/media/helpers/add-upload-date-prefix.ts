/**
 * Prepends the upload date to a file name as `YYMMDD-`, using the uploader's local date.
 * The prefix is a plain part of the name, so users can rename it later to the day the
 * photo or document was actually made.
 *
 * @param fileName - Original file name with its extension.
 * @param date - Upload date; defaults to now.
 * @returns The file name with the date prefix, for example `261124-IMG_0001.jpg`.
 */
export function addUploadDatePrefix(
  fileName: string,
  date: Date = new Date(),
): string {
  const year = String(date.getFullYear() % 100).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}-${fileName}`;
}
