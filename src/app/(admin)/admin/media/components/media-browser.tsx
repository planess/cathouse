'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeFolderPath } from '../helpers/normalize-folder-path';
import { uploadFile } from '../helpers/upload-file';

import { MediaBrowserFileTable } from './media-browser-file-table';
import { MediaBrowserFolderTree } from './media-browser-folder-tree';
import { MediaBrowserToolbar } from './media-browser-toolbar';
import { MediaUploadProgress } from './media-upload-progress';

export type CloudFolder = {
  name: string;
  path: string;
};

export type CloudFile = {
  name: string;
  path: string;
  size: number;
  lastModified: string;
};

export type FolderContents = {
  files: CloudFile[];
  folders: CloudFolder[];
};

export type FetchState = 'idle' | 'loading' | 'loaded' | 'error';

export type UploadStatus = 'requesting' | 'uploading' | 'completed' | 'error';

export type UploadItem = {
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

type RenameFolderResponse = {
  from: string;
  renamedFiles: number;
  to: string;
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
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{
    name: string;
    path: string;
  } | null>(null);
  const [fileToDelete, setFileToDelete] = useState<CloudFile | null>(null);
  const [fileToRename, setFileToRename] = useState<CloudFile | null>(null);
  const [folderToRename, setFolderToRename] = useState<{
    name: string;
    path: string;
  } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [isRenamingFile, setIsRenamingFile] = useState(false);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [moveDestinations, setMoveDestinations] = useState<Map<string, string>>(
    new Map(),
  );
  const [draggedFile, setDraggedFile] = useState<CloudFile | null>(null);

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

  const expandFolder = (path: string) => {
    const normalizedPath = normalizeFolderPath(path);

    setExpandedPaths((current) => {
      const next = new Set(current);

      next.add(normalizedPath);

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

  const handleCreateFolder = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const folderName = newFolderName.trim();

    if (
      folderName === '' ||
      folderName === '.' ||
      folderName === '..' ||
      folderName.includes('/') ||
      folderName.includes('\\')
    ) {
      setError('Enter a valid folder name.');
      return;
    }

    const markerPath = [selectedPath, folderName, '.bzEmpty']
      .filter(Boolean)
      .join('/');

    setIsCreatingFolder(true);
    setError('');

    try {
      const response = await fetch('/api/admin/media', {
        body: JSON.stringify({ files: [{ path: markerPath }] }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload = (await response.json()) as
        | SignedUploadResponse
        | { error: string };

      if (!response.ok || !('files' in payload)) {
        throw new Error(
          'error' in payload
            ? payload.error
            : 'Unable to obtain an upload URL.',
        );
      }

      const markerUrl = payload.files.find(
        (file) => file.path === markerPath,
      )?.url;

      if (markerUrl === undefined) {
        throw new Error('No upload URL was returned for the new folder.');
      }

      await uploadFile(new File([], '.bzEmpty'), markerUrl, () => null);
      setIsFolderDialogOpen(false);
      setNewFolderName('');
      await loadFolder(selectedPath);
    } catch (folderError) {
      setError(
        folderError instanceof Error
          ? folderError.message
          : 'Unable to create the folder.',
      );
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (folderToDelete === null) {
      return;
    }

    const parentPath = folderToDelete.path.split('/').slice(0, -1).join('/');
    const markerPath = `${folderToDelete.path}/.bzEmpty`;

    setIsDeletingFolder(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/media?path=${encodeURIComponent(markerPath)}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };

        throw new Error(payload.error ?? 'Unable to delete the folder.');
      }

      setIsDeleteDialogOpen(false);
      setFolderToDelete(null);
      setExpandedPaths((current) => {
        const next = new Set(current);

        next.delete(folderToDelete.path);

        return next;
      });
      await loadFolder(parentPath);

      if (
        selectedPath === folderToDelete.path ||
        selectedPath.startsWith(`${folderToDelete.path}/`)
      ) {
        setSelectedPath(parentPath);
        await loadFolder(parentPath);
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete the folder.',
      );
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const openFolderDeleteDialog = (path: string, name: string) => {
    setFolderToDelete({ name, path });
    setIsDeleteDialogOpen(true);
  };

  const startMove = (file: CloudFile) => {
    setDraggedFile(file);
  };

  const endMoveDrag = () => {
    setDraggedFile(null);
  };

  const setMoveDestination = (destination: string) => {
    if (draggedFile === null || destination === selectedPath) {
      return;
    }

    setMoveDestinations((current) =>
      new Map(current).set(draggedFile.path, destination),
    );
    setDraggedFile(null);
  };

  const cancelMove = () => {
    setDraggedFile(null);
    setMoveDestinations(new Map());
  };

  const applyMove = async () => {
    const files = [...moveDestinations].map(([currentPath, destination]) => ({
      currentPath,
      newPath: [destination, currentPath.split('/').at(-1) ?? '']
        .filter(Boolean)
        .join('/'),
    }));

    if (files.length === 0) {
      cancelMove();
      return;
    }

    try {
      const response = await fetch('/api/admin/media', {
        body: JSON.stringify({ files }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to move files.');
      }

      cancelMove();
      await Promise.all(
        [...new Set(['', selectedPath, ...moveDestinations.values()])].map(
          (path) => loadFolder(path),
        ),
      );
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : 'Unable to move files.',
      );
    }
  };

  const handleDeleteFile = async () => {
    if (fileToDelete === null) {
      return;
    }

    setError('');

    try {
      const response = await fetch(
        `/api/admin/media?path=${encodeURIComponent(fileToDelete.path)}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };

        throw new Error(payload.error ?? 'Unable to delete the file.');
      }

      setFileToDelete(null);
      await loadFolder(selectedPath);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete the file.',
      );
    }
  };

  const handleRenameFile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fileToRename === null) {
      return;
    }

    const fileName = newFileName.trim();

    if (
      fileName === '' ||
      fileName === '.' ||
      fileName === '..' ||
      fileName.includes('/') ||
      fileName.includes('\\')
    ) {
      setError('Enter a valid file name.');
      return;
    }

    const parentPath = fileToRename.path.split('/').slice(0, -1).join('/');
    const newPath = [parentPath, fileName].filter(Boolean).join('/');

    setIsRenamingFile(true);
    setError('');

    try {
      const response = await fetch('/api/admin/media', {
        body: JSON.stringify({ path: fileToRename.path, newPath }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };

        throw new Error(payload.error ?? 'Unable to rename the file.');
      }

      setFileToRename(null);
      setNewFileName('');
      await loadFolder(selectedPath);
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : 'Unable to rename the file.',
      );
    } finally {
      setIsRenamingFile(false);
    }
  };

  const openRenameDialog = (file: CloudFile) => {
    setFileToRename(file);
    setNewFileName(file.name);
  };

  const handleRenameFolder = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (folderToRename === null) {
      return;
    }

    const newName = newFolderName.trim();

    if (
      newName === '' ||
      newName === '.' ||
      newName === '..' ||
      newName.includes('/') ||
      newName.includes('\\')
    ) {
      setError('Enter a valid folder name.');
      return;
    }

    const parentPath = folderToRename.path.split('/').slice(0, -1).join('/');

    setIsRenamingFolder(true);
    setError('');

    try {
      const response = await fetch('/api/admin/media', {
        body: JSON.stringify({
          folderPath: folderToRename.path,
          newName,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };

        throw new Error(payload.error ?? 'Unable to rename the folder.');
      }

      const payload = (await response.json()) as RenameFolderResponse;
      const fromPath = normalizeFolderPath(payload.from);
      const toPath = normalizeFolderPath(payload.to);
      const isSelectedBranch =
        selectedPath === fromPath || selectedPath.startsWith(`${fromPath}/`);

      setFolderToRename(null);
      setNewFolderName('');
      setContents((current) => {
        const next = { ...current };

        delete next[fromPath];

        return next;
      });
      setExpandedPaths(
        (current) =>
          new Set(
            [...current].map((path) =>
              path === fromPath || path.startsWith(`${fromPath}/`)
                ? path.replace(fromPath, toPath)
                : path,
            ),
          ),
      );
      await loadFolder(parentPath);

      if (isSelectedBranch) {
        const nextSelectedPath = selectedPath.replace(fromPath, toPath);

        setSelectedPath(nextSelectedPath);
        await loadFolder(nextSelectedPath);
      }
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : 'Unable to rename the folder.',
      );
    } finally {
      setIsRenamingFolder(false);
    }
  };

  const openFolderRenameDialog = (path: string, name: string) => {
    setFolderToRename({ name, path });
    setNewFolderName(name);
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
          <MediaBrowserFolderTree
            contents={contents}
            expandedPaths={expandedPaths}
            onSelect={selectFolder}
            onExpand={expandFolder}
            onDelete={openFolderDeleteDialog}
            onDropFile={setMoveDestination}
            onRename={openFolderRenameDialog}
            isMoveMode={moveDestinations.size > 0}
            selectedPath={selectedPath}
          />

          <div className="min-w-0 p-4 sm:p-6">
            <MediaBrowserToolbar
              fileInputRef={fileInputRef}
              isLoading={isLoading}
              isUploading={isUploading}
              onAddFolder={() => setIsFolderDialogOpen(true)}
              isMoveMode={moveDestinations.size > 0}
              onApplyMove={() => void applyMove()}
              onCancelMove={cancelMove}
              onFilesSelected={(event) => void handleFilesSelected(event)}
              onRefresh={() => void loadFolder(selectedPath)}
              selectedLabel={selectedLabel}
            />

            {error && (
              <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            )}

            <MediaUploadProgress uploads={uploads} />

            {isLoading ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading files…
              </p>
            ) : selectedContents ? (
              <MediaBrowserFileTable
                files={visibleFiles}
                isEmpty={isEmpty}
                onDelete={setFileToDelete}
                onMoveEnd={endMoveDrag}
                onMoveStart={startMove}
                onRename={openRenameDialog}
                moveDestinations={moveDestinations}
                isMoveMode={moveDestinations.size > 0}
              />
            ) : (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Choose a folder to view its contents.
              </p>
            )}
          </div>
        </div>
      </section>

      {isFolderDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onSubmit={(event) => void handleCreateFolder(event)}
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Add folder
            </h2>
            <label className="mt-4 block text-sm text-slate-600 dark:text-slate-300">
              New folder in <b>{selectedLabel}</b>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                disabled={isCreatingFolder}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="Folder name"
                value={newFolderName}
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                disabled={isCreatingFolder}
                onClick={() => setIsFolderDialogOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
                disabled={isCreatingFolder}
                type="submit"
              >
                {isCreatingFolder ? 'Creating...' : 'Create folder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isDeleteDialogOpen && folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete folder?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Delete the folder <b>{folderToDelete.name}</b>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                disabled={isDeletingFolder}
                onClick={() => setIsDeleteDialogOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                disabled={isDeletingFolder}
                onClick={() => void handleDeleteFolder()}
                type="button"
              >
                {isDeletingFolder ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete file?
            </h2>
            <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">
              Delete <b>{fileToDelete.name}</b> permanently?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setFileToDelete(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                onClick={() => void handleDeleteFile()}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {fileToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onSubmit={(event) => void handleRenameFile(event)}
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Rename file
            </h2>
            <label className="mt-4 block text-sm text-slate-600 dark:text-slate-300">
              New file name
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                disabled={isRenamingFile}
                onChange={(event) => setNewFileName(event.target.value)}
                value={newFileName}
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                disabled={isRenamingFile}
                onClick={() => setFileToRename(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
                disabled={isRenamingFile}
                type="submit"
              >
                {isRenamingFile ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </form>
        </div>
      )}

      {folderToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onSubmit={(event) => void handleRenameFolder(event)}
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Rename folder
            </h2>
            <label className="mt-4 block text-sm text-slate-600 dark:text-slate-300">
              New folder name
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                disabled={isRenamingFolder}
                onChange={(event) => setNewFolderName(event.target.value)}
                value={newFolderName}
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                disabled={isRenamingFolder}
                onClick={() => setFolderToRename(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
                disabled={isRenamingFolder}
                type="submit"
              >
                {isRenamingFolder ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
