import type { MediaFolderFile } from '@app/models/media-folder-file';

import { getSafeMediaPath } from './get-safe-media-path';

/**
 * Lists the files stored directly in a media storage folder through the media worker.
 * Server-only: reads `R2_MEDIA_BASE_URL`.
 *
 * TODO: the worker's `files/` listing returns at most 1000 entries per folder
 * (no pagination), so files beyond that are not seen by the duplicate check.
 *
 * @param folderPath - Folder path without leading or trailing slashes; empty for the root.
 * @returns The files in the folder, without subfolders.
 * @throws When the folder path is invalid or the worker cannot list the folder.
 */
export async function listMediaFolderFiles(
  folderPath: string,
): Promise<MediaFolderFile[]> {
  const safeFolderPath = getSafeMediaPath(folderPath);

  if (safeFolderPath === null) {
    throw new Error(`Invalid folder path: ${folderPath}`);
  }

  const response = await fetch(
    `${process.env.R2_MEDIA_BASE_URL}/files/${safeFolderPath}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Unable to list media folder (HTTP ${response.status}).`);
  }

  const { files } = (await response.json()) as { files?: MediaFolderFile[] };

  return Array.isArray(files) ? files : [];
}
