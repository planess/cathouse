'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { EmptyFolderRow } from '../helpers/empty-folder-row';
import { FileIcon } from '../helpers/file-icon';
import { FolderIcon } from '../helpers/folder-icon';
import { formatFileSize } from '../helpers/format-file-size';
import { formatLastModified } from '../helpers/format-last-modified';
import { normalizeFolderPath } from '../helpers/normalize-folder-path';
import { uploadFile } from '../helpers/upload-file';

type CloudFolder = {
  name: string;
  path: string;
};

type CloudFile = {
  name: string;
  path: string;
  size: number;
  lastModified: string;
};

type FolderContents = {
  files: CloudFile[];
  folders: CloudFolder[];
};

type FetchState = 'idle' | 'loading' | 'loaded' | 'error';

type UploadStatus = 'requesting' | 'uploading' | 'completed' | 'error';

type UploadItem = {
  file: File;
  id: string;
  path: string;
  progress: number;
  status: UploadStatus;
};

type SignedUpload = {
  path: string;
  url: string;
};

type SignedUploadResponse = {
  files: SignedUpload[];
};

export function MediaBrowser() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contents, setContents] = useState<
    Partial<Record<string, FolderContents>>
  >({});
  const [states, setStates] = useState<Partial<Record<string, FetchState>>>({});
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState('');
  const [error, setError] = useState('');
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const loadFolder = useCallback(async (path: string) => {
    const normalizedPath = normalizeFolderPath(path);

    setStates((current) => ({ ...current, [normalizedPath]: 'loading' }));
    setError('');

    try {
      const query = new URLSearchParams();

      if (normalizedPath !== '') {
        query.set('path', normalizedPath);
      }

      const response = await fetch(`/api/admin/media?${query.toString()}`);
      const payload = (await response.json()) as
        | FolderContents
        | { error: string };

      if (!response.ok || !('folders' in payload) || !('files' in payload)) {
        throw new Error(
          'error' in payload ? payload.error : 'Unable to load this folder.',
        );
      }

      setContents((current) => ({ ...current, [normalizedPath]: payload }));
      setStates((current) => ({ ...current, [normalizedPath]: 'loaded' }));
    } catch (loadError) {
      setStates((current) => ({ ...current, [normalizedPath]: 'error' }));
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load this folder.',
      );
    }
  }, []);

  useEffect(() => {
    void loadFolder('');
  }, [loadFolder]);

  const selectFolder = (path: string) => {
    const normalizedPath = normalizeFolderPath(path);

    setSelectedPath(normalizedPath);

    if (states[normalizedPath] !== 'loaded') {
      void loadFolder(normalizedPath);
    }
  };

  const toggleFolder = (path: string) => {
    const normalizedPath = normalizeFolderPath(path);

    setExpandedPaths((current) => {
      const next = new Set(current);

      if (next.has(normalizedPath)) {
        next.delete(normalizedPath);
      } else {
        next.add(normalizedPath);
      }

      return next;
    });
    selectFolder(normalizedPath);
  };

  const updateUpload = (
    id: string,
    update: Partial<Pick<UploadItem, 'progress' | 'status'>>,
  ) => {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id ? { ...upload, ...update } : upload,
      ),
    );
  };

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = [...(event.target.files ?? [])];

    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    const uploadItems = files.map((file, index) => ({
      file,
      id: `${file.name}-${file.lastModified}-${index}`,
      path: [selectedPath, file.name].filter(Boolean).join('/'),
      progress: 0,
      status: 'requesting' as const,
    }));

    setUploads(uploadItems);
    setError('');

    try {
      const response = await fetch('/api/admin/media', {
        body: JSON.stringify({
          files: uploadItems.map(({ path }) => ({ path })),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload = (await response.json()) as
        | SignedUploadResponse
        | { error: string };

      if (!response.ok || !('files' in payload)) {
        throw new Error(
          'error' in payload ? payload.error : 'Unable to obtain upload URLs.',
        );
      }

      const signedUrlByPath = new Map(
        payload.files.map((signedFile) => [signedFile.path, signedFile.url]),
      );

      const results = await Promise.allSettled(
        uploadItems.map(async (upload) => {
          const url = signedUrlByPath.get(upload.path);

          if (url === undefined) {
            updateUpload(upload.id, { status: 'error' });
            throw new Error(`No upload URL was returned for ${upload.path}.`);
          }

          updateUpload(upload.id, { status: 'uploading' });

          try {
            await uploadFile(upload.file, url, (progress) =>
              updateUpload(upload.id, { progress }),
            );
            updateUpload(upload.id, { progress: 100, status: 'completed' });
          } catch (uploadError) {
            updateUpload(upload.id, { status: 'error' });
            throw uploadError;
          }
        }),
      );

      if (results.some((result) => result.status === 'rejected')) {
        throw new Error('Some files could not be uploaded.');
      }

      await loadFolder(selectedPath);
    } catch (uploadError) {
      setUploads((current) =>
        current.map((upload) =>
          upload.status === 'completed'
            ? upload
            : { ...upload, status: 'error' },
        ),
      );
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Unable to upload files.',
      );
    }
  };

  const renderTree = (path: string, depth = 0): React.ReactNode => {
    const listing = contents[path];

    if (!listing) {
      return null;
    }

    return listing.folders.map((folder) => {
      const folderPath = normalizeFolderPath(folder.path);
      const isExpanded = expandedPaths.has(folderPath);

      return (
        <div key={folderPath}>
          <button
            className={`flex w-full items-center gap-2 rounded-lg py-2 pr-2 text-left text-sm transition ${
              selectedPath === folderPath
                ? 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            onClick={() => toggleFolder(folderPath)}
            style={{ paddingLeft: `${depth * 16 + 10}px` }}
            type="button"
          >
            <span className="w-3 text-center text-xs text-slate-400">
              {isExpanded ? '⌄' : '›'}
            </span>
            <FolderIcon open={isExpanded} />
            <span className="truncate">{folder.name}</span>
          </button>
          {isExpanded && renderTree(folderPath, depth + 1)}
        </div>
      );
    });
  };

  const selectedContents = contents[selectedPath];
  const visibleFiles =
    selectedContents?.files.filter((file) => file.name !== '.bzEmpty') ?? [];
  const selectedLabel = selectedPath || 'Root';
  const isLoading = states[selectedPath] === 'loading';
  const isUploading = uploads.some(
    ({ status }) => status === 'requesting' || status === 'uploading',
  );
  const isEmpty = selectedContents !== undefined && visibleFiles.length === 0;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Media
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse files stored in cloud media storage and download the files you
          need.
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="grid min-h-[32rem] lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="border-b border-slate-200/70 p-4 dark:border-slate-800 lg:border-b-0 lg:border-r">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Folders
            </p>
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium transition ${
                selectedPath === ''
                  ? 'bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              onClick={() => selectFolder('')}
              type="button"
            >
              <FolderIcon open />
              Root
            </button>
            <div className="mt-1">{renderTree('')}</div>
          </aside>

          <div className="min-w-0 p-4 sm:p-6">
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
                <input
                  className="sr-only"
                  multiple
                  onChange={(event) => void handleFilesSelected(event)}
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
                  onClick={() => void loadFolder(selectedPath)}
                  type="button"
                >
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            )}

            {uploads.length > 0 && (
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
            )}

            {isLoading ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading files…
              </p>
            ) : selectedContents ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="border-b border-slate-200/70 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-3 font-semibold">Name</th>
                      <th className="px-3 py-3 font-semibold">Size</th>
                      <th className="px-3 py-3 font-semibold">Last modified</th>
                      <th className="px-3 py-3 font-semibold">
                        <span className="sr-only">Download</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleFiles.map((file) => (
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
                          <a
                            className="inline-flex rounded-lg px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/10"
                            href={`/api/admin/media?path=${encodeURIComponent(file.path)}&download=1`}
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                    {isEmpty ? <EmptyFolderRow /> : null}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Choose a folder to view its contents.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
