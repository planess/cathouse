import type { MediaUploadMetadata } from '@app/models/media-upload-metadata';

import { getMediaFileName } from './get-media-file-name';

/** Longest original file name kept in metadata, in characters before encoding. */
const MAX_ORIGINAL_NAME_LENGTH = 255;

/**
 * Builds the metadata stored with an uploaded media file.
 *
 * @param path - Storage key the file is uploaded to; its last segment is used when no original name is given.
 * @param uploadedBy - Identifier of the uploading user.
 * @param uploadedAt - Upload time shared by every file in the same request.
 * @param originalName - File name reported by the client, if any.
 * @returns ASCII-only metadata ready to be signed as `x-amz-meta-*` headers.
 */
export function buildMediaUploadMetadata(
  path: string,
  uploadedBy: string,
  uploadedAt: Date,
  originalName?: unknown,
): MediaUploadMetadata {
  const name =
    typeof originalName === 'string' && originalName.trim() !== ''
      ? originalName.trim()
      : getMediaFileName(path);

  return {
    'original-name': encodeURIComponent(
      name.slice(0, MAX_ORIGINAL_NAME_LENGTH),
    ),
    'uploaded-at': uploadedAt.toISOString(),
    'uploaded-by': uploadedBy,
  };
}
