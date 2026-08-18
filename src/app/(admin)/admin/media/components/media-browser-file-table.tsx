import { EmptyFolderRow } from '../helpers/empty-folder-row';
import { FileIcon } from '../helpers/file-icon';
import { formatFileSize } from '../helpers/format-file-size';
import { formatLastModified } from '../helpers/format-last-modified';

import type { CloudFile } from './media-browser';

type Props = {
  files: CloudFile[];
  isEmpty: boolean;
  onDelete: (file: CloudFile) => void;
};

export function MediaBrowserFileTable({ files, isEmpty, onDelete }: Props) {
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
                  <FileIcon />
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
                <div className="flex justify-end gap-1">
                  <a
                    className="inline-flex rounded-lg px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10"
                    href={`/api/admin/media?path=${encodeURIComponent(file.path)}&download=1`}
                  >
                    Download
                  </a>
                  <button
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    onClick={() => onDelete(file)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {isEmpty ? <EmptyFolderRow /> : null}
        </tbody>
      </table>
    </div>
  );
}
