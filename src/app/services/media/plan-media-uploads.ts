import type { MediaFolderFile } from '@app/models/media-folder-file';
import type { MediaUploadPlan } from '@app/models/media-upload-plan';
import type { MediaUploadRequest } from '@app/models/media-upload-request';

import { addMediaNameSuffix } from './add-media-name-suffix';
import { listMediaFolderFiles } from './list-media-folder-files';
import { stripMediaDatePrefix } from './strip-media-date-prefix';

/** Most attempts at finding a free random suffix before giving up. */
const MAX_SUFFIX_ATTEMPTS = 20;

/** Files of one folder, as seen while planning a batch. */
type FolderState = {
  /** Every file name already used in the folder, including earlier files of this batch. */
  takenNames: Set<string>;
  /** Files grouped by name without the date prefix. */
  filesByBaseName: Map<string, Array<{ path: string; size?: number }>>;
};

/**
 * Splits a storage path into its folder and file name.
 *
 * @param path - Storage path such as `cats/261124-IMG_1.jpg`.
 * @returns The folder (empty for the root) and the file name.
 */
function splitPath(path: string): [string, string] {
  const slashIndex = path.lastIndexOf('/');

  return slashIndex === -1
    ? ['', path]
    : [path.slice(0, slashIndex), path.slice(slashIndex + 1)];
}

/**
 * Builds the lookup state for a folder from its stored files.
 *
 * @param files - Files stored directly in the folder.
 * @returns The folder state used while planning.
 */
function createFolderState(files: MediaFolderFile[]): FolderState {
  const state: FolderState = {
    filesByBaseName: new Map(),
    takenNames: new Set(),
  };

  for (const file of files) {
    rememberFile(state, file.name, file.path, file.size);
  }

  return state;
}

/**
 * Records a stored or planned file in the folder state.
 *
 * @param state - Folder state to update.
 * @param name - Stored file name.
 * @param path - Full storage path.
 * @param size - File size in bytes, when known.
 */
function rememberFile(
  state: FolderState,
  name: string,
  path: string,
  size?: number,
): void {
  const baseName = stripMediaDatePrefix(name);

  state.takenNames.add(name);
  state.filesByBaseName.set(baseName, [
    ...(state.filesByBaseName.get(baseName) ?? []),
    { path, size },
  ]);
}

/**
 * Decides, for every requested upload, whether it is uploaded and under which path.
 * Only the target folder of each file is checked, never the whole storage:
 * - a stored file with the same name (ignoring any `YYMMDD-` prefix) and the same
 *   size makes the upload a duplicate, which is not uploaded;
 * - otherwise the file is uploaded to the requested path, or, when that name is
 *   already taken, to the same name with a random 4-character suffix.
 * Files earlier in the same batch count as stored files.
 * Requests without `originalName` (such as folder markers) are uploaded as requested.
 *
 * @param requests - Requested uploads, in order.
 * @returns One plan per request, in the same order.
 * @throws When a target folder cannot be listed or no free suffix is found.
 */
export async function planMediaUploads(
  requests: MediaUploadRequest[],
): Promise<MediaUploadPlan[]> {
  const checkedFolders = [
    ...new Set(
      requests
        .filter((request) => request.originalName !== undefined)
        .map((request) => splitPath(request.path)[0]),
    ),
  ];
  const folderStates = new Map(
    await Promise.all(
      checkedFolders.map(
        async (folder) =>
          [
            folder,
            createFolderState(await listMediaFolderFiles(folder)),
          ] as const,
      ),
    ),
  );

  return requests.map((request): MediaUploadPlan => {
    const [folder, requestedName] = splitPath(request.path);
    const state = folderStates.get(folder);

    if (request.originalName === undefined || state === undefined) {
      return { path: request.path, status: 'upload' };
    }

    const duplicate =
      request.size === undefined
        ? undefined
        : state.filesByBaseName
            .get(request.originalName)
            ?.find((file) => file.size === request.size);

    if (duplicate) {
      return { existingPath: duplicate.path, status: 'duplicate' };
    }

    let name = requestedName;

    for (
      let attempt = 0;
      state.takenNames.has(name) && attempt < MAX_SUFFIX_ATTEMPTS;
      attempt += 1
    ) {
      name = addMediaNameSuffix(requestedName, request.originalName);
    }

    if (state.takenNames.has(name)) {
      throw new Error(`No free file name was found for ${request.path}.`);
    }

    const path = folder === '' ? name : `${folder}/${name}`;

    // Remember the planned file under the original name, so a later file of the
    // same batch with the same name and size is caught as a duplicate.
    state.takenNames.add(name);
    state.filesByBaseName.set(request.originalName, [
      ...(state.filesByBaseName.get(request.originalName) ?? []),
      { path, size: request.size },
    ]);

    return { path, status: 'upload' };
  });
}
