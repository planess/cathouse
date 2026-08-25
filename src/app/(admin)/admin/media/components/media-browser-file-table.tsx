import clsx from 'clsx';

import { EmptyFolderRow } from '../helpers/empty-folder-row';
import { FileIcon } from '../helpers/file-icon';
import { formatFileSize } from '../helpers/format-file-size';
import { formatLastModified } from '../helpers/format-last-modified';
import { imagePreviewUrl } from '../helpers/image-preview-url';
import { isPreviewableFile } from '../helpers/is-previewable-file';

import type { CloudFile } from './media-browser';

type Props = {
  canDelete: boolean;
  canMove: boolean;
  canRename: boolean;
  files: CloudFile[];
  isEmpty: boolean;
  onDelete: (file: CloudFile) => void;
  onRename: (file: CloudFile) => void;
  onMoveStart: (file: CloudFile) => void;
  onMoveEnd: () => void;
  moveDestinations: Map<string, string>;
  isMoveMode: boolean;
};

export function MediaBrowserFileTable({
  canDelete,
  canMove,
  canRename,
  files,
  isEmpty,
  onDelete,
  onRename,
  onMoveStart,
  onMoveEnd,
  moveDestinations,
  isMoveMode,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-slate-200/70 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-3 py-3 font-semibold">Name</th>
            <th className="px-3 py-3 font-semibold">Size</th>
            <th className="px-3 py-3 font-semibold">Last modified</th>
            <th className="px-3 py-3 font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {files.map((file) => (
            <tr key={file.path}>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                  <button
                    aria-label={`Move ${file.name}`}
                    className={clsx(
                      '-ml-2 rounded bg-sky-100 text-sky-700 transition dark:bg-sky-500/20 dark:text-sky-200',
                      'flex-none basis-[90px] flex items-center justify-center',
                      {
                        'cursor-grab hover:bg-sky-200 active:cursor-grabbing dark:hover:bg-sky-500/30':
                          canMove,
                        'cursor-default': !canMove,
                        'p-2': !isPreviewableFile(file.name),
                      },
                    )}
                    draggable={canMove}
                    onDragEnd={canMove ? onMoveEnd : undefined}
                    onDragStart={canMove ? () => onMoveStart(file) : undefined}
                    type="button"
                  >
                    {isPreviewableFile(file.name) ? (
                      <img
                        alt=""
                        className="h-16 w-[90px] rounded object-contain"
                        src={imagePreviewUrl(file.path, 150)}
                      />
                    ) : (
                      <FileIcon />
                    )}
                  </button>
                  <span className="break-all">{file.name}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                {formatFileSize(file.size)}
              </td>
              <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                {formatLastModified(file.lastModified)}
              </td>
              <td className="px-3 py-3 text-right">
                {isMoveMode ? (
                  <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                    →{' '}
                    {(moveDestinations.get(file.path) ?? 'Select folder') ||
                      'Root'}
                  </span>
                ) : (
                  <div className="flex justify-end gap-1">
                    <a
                      aria-label={`Download ${file.name}`}
                      className="rounded-lg p-2 text-sky-700 transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10"
                      href={`/api/admin/media?path=${encodeURIComponent(file.path)}&download=1`}
                    >
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 16.5v2a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-2"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </a>
                    {canRename && (
                      <button
                        aria-label={`Rename ${file.name}`}
                        className="rounded-lg px-2 py-1 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => onRename(file)}
                        type="button"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
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
                    )}
                    {canDelete && (
                      <button
                        aria-label={`Delete ${file.name}`}
                        className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        onClick={() => onDelete(file)}
                        type="button"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5.5 7.5h13M10 3.75h4M8.25 7.5l.5 11.25h6.5l.5-11.25"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
          {isEmpty ? <EmptyFolderRow /> : null}
        </tbody>
      </table>
    </div>
  );
}
