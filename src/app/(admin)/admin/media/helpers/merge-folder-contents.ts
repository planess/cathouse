import type {
  CloudFile,
  CloudFolder,
  FolderContents,
} from '../components/media-browser';

/**
 * Reuses the previous items of a list for every entry that did not change,
 * so React keeps those rows as they are and only adds or removes the changed ones.
 *
 * @param previous - Items currently shown.
 * @param next - Items just loaded, in the order to show.
 * @param isSame - Whether a previous and a loaded item are identical.
 * @returns `previous` itself when nothing changed, otherwise `next` with unchanged items reused.
 */
function mergeItems<T extends { path: string }>(
  previous: T[],
  next: T[],
  isSame: (left: T, right: T) => boolean,
): T[] {
  const previousByPath = new Map(previous.map((item) => [item.path, item]));
  const merged = next.map((item) => {
    const existing = previousByPath.get(item.path);

    return existing && isSame(existing, item) ? existing : item;
  });

  return merged.length === previous.length &&
    merged.every((item, index) => item === previous[index])
    ? previous
    : merged;
}

/**
 * Merges a freshly loaded folder listing into the one already shown, without
 * replacing unchanged files and folders, so a silent refresh does not redraw the list.
 *
 * @param previous - Listing currently shown, if the folder was loaded before.
 * @param next - Listing just loaded.
 * @returns `previous` itself when nothing changed, otherwise the merged listing.
 */
export function mergeFolderContents(
  previous: FolderContents | undefined,
  next: FolderContents,
): FolderContents {
  if (previous === undefined) {
    return next;
  }

  const folders = mergeItems<CloudFolder>(
    previous.folders,
    next.folders,
    (left, right) => left.name === right.name,
  );
  const files = mergeItems<CloudFile>(
    previous.files,
    next.files,
    (left, right) =>
      left.name === right.name &&
      left.size === right.size &&
      left.lastModified === right.lastModified,
  );

  return folders === previous.folders && files === previous.files
    ? previous
    : { files, folders };
}
