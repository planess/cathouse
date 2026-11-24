import { randomInt } from 'crypto';

/** Characters a random name suffix is built from. */
const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
/** Number of random characters in a name suffix. */
const SUFFIX_LENGTH = 4;

/**
 * Splits a file name into its stem and extension (with the dot).
 * A leading dot, as in `.env`, is part of the stem.
 *
 * @param fileName - File name to split.
 * @returns The stem and the extension, which is empty when there is none.
 */
function splitExtension(fileName: string): [string, string] {
  const dotIndex = fileName.lastIndexOf('.');

  if (dotIndex <= 0) {
    return [fileName, ''];
  }

  return [fileName.slice(0, dotIndex), fileName.slice(dotIndex)];
}

/**
 * Appends a random 4-character suffix to a file name, before its extension.
 * The separator depends on the original file name without its extension:
 * `-` when it has no `-`, `_` when it has `-` but no `_`, and `.` when it has both.
 *
 * @param fileName - Stored file name to add the suffix to, such as `261124-IMG_1.jpg`.
 * @param originalName - File name from the uploader's device, used to choose the separator.
 * @returns The file name with the suffix, such as `261124-IMG_1-k3f9.jpg`.
 */
export function addMediaNameSuffix(
  fileName: string,
  originalName: string,
): string {
  const [originalStem] = splitExtension(originalName);
  const separator = !originalStem.includes('-')
    ? '-'
    : !originalStem.includes('_')
      ? '_'
      : '.';
  const suffix = Array.from(
    { length: SUFFIX_LENGTH },
    () => SUFFIX_ALPHABET[randomInt(SUFFIX_ALPHABET.length)],
  ).join('');
  const [stem, extension] = splitExtension(fileName);

  return `${stem}${separator}${suffix}${extension}`;
}
