import { FolderIcon } from '../helpers/folder-icon';

import type { FolderContents } from './media-browser';

type Props = {
  contents: Partial<Record<string, FolderContents>>;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onExpand: (path: string) => void;
  onRename: (path: string, name: string) => void;
  selectedPath: string;
};

export function MediaBrowserFolderTree({
  contents,
  expandedPaths,
  onSelect,
  onExpand,
  onRename,
  selectedPath,
}: Props) {
  const renderTree = (path: string, depth = 0): React.ReactNode =>
    (contents[path]?.folders ?? []).map((folder) => {
      const folderPath = folder.path.replaceAll(/^\/+|\/+$/g, '');
      const isExpanded = expandedPaths.has(folderPath);
      return (
        <div key={folderPath}>
          <div
            className={`flex items-center rounded-lg text-sm transition ${selectedPath === folderPath ? 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            style={{ paddingLeft: `${depth * 16 + 10}px` }}
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
              onClick={() => onExpand(folderPath)}
              type="button"
            >
              <span className="w-1 text-center text-xs text-slate-400"> </span>
              <FolderIcon open={isExpanded} />
              <span className="truncate">{folder.name}</span>
            </button>
            <button
              aria-label={`Rename ${folder.name}`}
              className="mr-1 rounded-md p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
              onClick={() => onRename(folderPath, folder.name)}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m14.5 5.5 4 4M5 19l3.25-.75L18.5 8a2.828 2.828 0 0 0-4-4L4.25 14.25 3.5 17.5 5 19Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
          {isExpanded && renderTree(folderPath, depth + 1)}
        </div>
      );
    });
  return (
    <aside className="border-b border-slate-200/70 p-4 dark:border-slate-800 lg:border-b-0 lg:border-r">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Folders
      </p>
      <button
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium transition ${selectedPath === '' ? 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
        onClick={() => onSelect('')}
        type="button"
      >
        <FolderIcon open />
        Root
      </button>
      <div className="mt-1">{renderTree('')}</div>
    </aside>
  );
}
