import type { UploadItem } from './media-browser';

export function MediaUploadProgress({ uploads }: { uploads: UploadItem[] }) {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
      {uploads.map((upload) => (
        <div key={upload.id}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">
              {upload.path}
            </span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {upload.status === 'completed'
                ? 'Uploaded'
                : upload.status === 'error'
                  ? 'Failed'
                  : `${upload.progress}%`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all ${
                upload.status === 'error'
                  ? 'bg-rose-500'
                  : upload.status === 'completed'
                    ? 'bg-emerald-500'
                    : 'bg-sky-500'
              }`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
