import type { ChangeEvent, RefObject } from 'react';

type Props = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isLoading: boolean;
  isUploading: boolean;
  onAddFolder: () => void;
  onFilesSelected: (event: ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  selectedLabel: string;
  isMoveMode: boolean;
  onApplyMove: () => void;
  onCancelMove: () => void;
};

export function MediaBrowserToolbar({
  fileInputRef,
  isLoading,
  isUploading,
  onAddFolder,
  onFilesSelected,
  onRefresh,
  selectedLabel,
  isMoveMode,
  onApplyMove,
  onCancelMove,
}: Props) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Current folder
        </p>
        <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
          {selectedLabel}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {isMoveMode ? (
          <>
            <button
              className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white"
              onClick={onApplyMove}
              type="button"
            >
              Apply
            </button>
            <button
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              onClick={onCancelMove}
              type="button"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <input
              className="sr-only"
              multiple
              onChange={onFilesSelected}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/30 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Upload
            </button>
            <button
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-200"
              disabled={isLoading}
              onClick={onRefresh}
              type="button"
            >
              Refresh
            </button>
            <button
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300"
              onClick={onAddFolder}
              type="button"
            >
              Add folder
            </button>
          </>
        )}
      </div>
    </div>
  );
}
