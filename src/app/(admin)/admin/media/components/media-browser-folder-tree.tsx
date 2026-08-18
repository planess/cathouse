import { FolderIcon } from '../helpers/folder-icon';

import type { FolderContents } from './media-browser';

type Props = {
  contents: Partial<Record<string, FolderContents>>;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  selectedPath: string;
};

export function MediaBrowserFolderTree({
  contents,
  expandedPaths,
  onSelect,
  onToggle,
  selectedPath,
}: Props) {
  const renderTree = (path: string, depth = 0): React.ReactNode =>
    (contents[path]?.folders ?? []).map((folder) => {
      const folderPath = folder.path.replaceAll(/^\/+|\/+$/g, '');
      const isExpanded = expandedPaths.has(folderPath);
      return (
        <div key={folderPath}>
          <button
            className={`flex w-full items-center gap-2 rounded-lg py-2 pr-2 text-left text-sm transition ${selectedPath === folderPath ? 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            onClick={() => onToggle(folderPath)}
            style={{ paddingLeft: `${depth * 16 + 10}px` }}
            type="button"
          >
            <span className="w-1 text-center text-xs text-slate-400"> </span>
            <FolderIcon open={isExpanded} />
            <span className="truncate">{folder.name}</span>
          </button>
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
