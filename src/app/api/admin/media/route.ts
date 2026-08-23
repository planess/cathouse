import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

const MEDIA_API_BASE_URL = 'http://127.0.0.1:8787';

function getSafePath(value: string | null): string | null {
  if (value === null || value === '') {
    return '';
  }

  const segments = value.split('/');

  if (
    segments.some(
      (segment) =>
        segment === '' ||
        segment === '.' ||
        segment === '..' ||
        segment.includes('\\'),
    )
  ) {
    return null;
  }

  return segments.map(encodeURIComponent).join('/');
}

function getFileName(path: string): string {
  return path.split('/').at(-1) ?? 'download';
}

async function canManageMedia(): Promise<boolean> {
  const currentUser = await getCurrentUser();

  return Boolean(
    currentUser?.id &&
    (await hasPermission(
      SYSTEM_PERMISSIONS.ROLE_ASSIGN,
      undefined,
      currentUser.id,
    )),
  );
}

/**
 * GET handler for media management.
 * Retrieves media files from cloud storage or provides temporary download URLs.
 * Supports listing files in a directory or downloading individual files.
 * Requires ROLE_ASSIGN permission.
 *
 * @param request - The incoming request with query parameters:
 *   - `path`: File or directory path
 *   - `download`: Set to '1' to download a file, omit to list directory contents
 * @returns JSON response with file list or file download with appropriate headers
 */
export async function GET(request: Request) {
  if (!(await canManageMedia())) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      {
        status: 403,
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const path = getSafePath(searchParams.get('path'));

  if (path === null) {
    return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
  }

  const isDownload = searchParams.get('download') === '1';

  if (isDownload && path === '') {
    return NextResponse.json(
      { error: 'A file path is required.' },
      {
        status: 400,
      },
    );
  }

  const endpoint = isDownload ? `file/${path}` : `files/${path}`;

  try {
    const response = await fetch(`${MEDIA_API_BASE_URL}/${endpoint}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to retrieve media from cloud storage.' },
        { status: response.status },
      );
    }

    if (!isDownload) {
      return NextResponse.json(await response.json());
    }

    const contentType =
      response.headers.get('content-type') ?? 'application/octet-stream';

    return new NextResponse(response.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${getFileName(path)}"`,
        'Content-Type': contentType,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to cloud storage.' },
      { status: 502 },
    );
  }
}

type GateRequest = {
  files?: Array<{ path?: unknown }>;
};

function isSafeFilePath(path: unknown): path is string {
  return typeof path === 'string' && getSafePath(path) !== null;
}

/**
 * POST handler for generating upload URLs.
 * Generates temporary URLs for uploading files to cloud storage.
 * Validates file paths and returns signed URLs with 5-minute expiration.
 * Requires ROLE_ASSIGN permission.
 *
 * @param request - The incoming request with JSON body containing:
 *   - `files`: Array of objects with `path` property specifying file upload destinations
 * @returns JSON response with signed upload URLs or error message
 */
export async function POST(request: Request) {
  if (!(await canManageMedia())) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  let body: GateRequest;

  try {
    body = (await request.json()) as GateRequest;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.files) || body.files.length === 0) {
    return NextResponse.json(
      { error: 'At least one file is required.' },
      { status: 400 },
    );
  }

  const files = body.files.map((file) => file.path);

  if (!files.every(isSafeFilePath)) {
    return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${MEDIA_API_BASE_URL}/sign?expiresInSeconds=300`,
      {
        body: JSON.stringify({ files: files.map((path) => ({ path })) }),
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to obtain upload URLs from cloud storage.' },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to cloud storage.' },
      { status: 502 },
    );
  }
}

/**
 * DELETE handler for removing files.
 * Deletes a file from cloud storage by its path.
 * Requires ROLE_ASSIGN permission.
 *
 * @param request - The incoming request with query parameter:
 *   - `path`: The file path to delete
 * @returns 204 No Content on success, or error JSON response on failure
 */
export async function DELETE(request: Request) {
  if (!(await canManageMedia())) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  const path = getSafePath(new URL(request.url).searchParams.get('path'));

  if (path === null || path === '') {
    return NextResponse.json(
      { error: 'A file path is required.' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${MEDIA_API_BASE_URL}/delete/${path}`, {
      cache: 'no-store',
      method: 'DELETE',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to delete the cloud file.' },
        { status: response.status },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to cloud storage.' },
      { status: 502 },
    );
  }
}

type RenamePayload = {
  destination?: unknown;
  destinationPath?: unknown;
  from?: unknown;
  key?: unknown;
  objectPath?: unknown;
  path?: unknown;
  newPath?: unknown;
  source?: unknown;
  target?: unknown;
  to?: unknown;
  folderPath?: unknown;
  newName?: unknown;
};

/**
 * PATCH handler for renaming files and folders.
 * Renames files or folders in cloud storage.
 * Supports two operation types:
 * - Folder rename: Updates `folderPath` and `newName`
 * - File rename: Moves file from `path` to `newPath`
 * Requires ROLE_ASSIGN permission.
 *
 * @param request - The incoming request with JSON body containing either:
 *   - Folder rename: `folderPath` and `newName`
 *   - File rename: source path (path/objectPath/key/from/source) and destination path (newPath/destination/destinationPath/to/target)
 * @returns JSON response with rename operation result or error message
 */
export async function PATCH(request: Request) {
  if (!(await canManageMedia())) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  let body: RenamePayload;

  try {
    body = (await request.json()) as RenamePayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  if (body.folderPath !== undefined || body.newName !== undefined) {
    const folderPath = body.folderPath;
    const newName = body.newName;

    if (
      !isSafeFilePath(folderPath) ||
      typeof newName !== 'string' ||
      newName.trim() === '' ||
      newName === '.' ||
      newName === '..' ||
      newName.includes('/') ||
      newName.includes('\\')
    ) {
      return NextResponse.json(
        { error: 'Invalid folder rename request.' },
        { status: 400 },
      );
    }

    try {
      const response = await fetch(`${MEDIA_API_BASE_URL}/rename-folder`, {
        body: JSON.stringify({ folderPath, newName: newName.trim() }),
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Unable to rename the cloud folder.' },
          { status: response.status },
        );
      }

      return NextResponse.json(await response.json());
    } catch {
      return NextResponse.json(
        { error: 'Unable to connect to cloud storage.' },
        { status: 502 },
      );
    }
  }

  const source = [
    body.path,
    body.objectPath,
    body.key,
    body.from,
    body.source,
  ].find(isSafeFilePath);
  const destination = [
    body.newPath,
    body.destination,
    body.destinationPath,
    body.to,
    body.target,
  ].find(isSafeFilePath);

  if (source === undefined || destination === undefined) {
    return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${MEDIA_API_BASE_URL}/rename`, {
      body: JSON.stringify({ path: source, newPath: destination }),
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to rename the cloud file.' },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to cloud storage.' },
      { status: 502 },
    );
  }
}

type MovePayload = {
  files?: Array<{ currentPath?: unknown; newPath?: unknown }>;
};

/**
 * PUT handler for moving files.
 * Moves multiple files in cloud storage to new paths.
 * Validates all file paths before processing the move operation.
 * Requires ROLE_ASSIGN permission.
 *
 * @param request - The incoming request with JSON body containing:
 *   - `files`: Array of objects with `currentPath` and `newPath` properties
 * @returns JSON response with move operation result or error message
 */
export async function PUT(request: Request) {
  if (!(await canManageMedia())) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  let body: MovePayload;

  try {
    body = (await request.json()) as MovePayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(body.files) ||
    body.files.length === 0 ||
    body.files.some(
      (file) =>
        !isSafeFilePath(file.currentPath) || !isSafeFilePath(file.newPath),
    )
  ) {
    return NextResponse.json(
      { error: 'Invalid move request.' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${MEDIA_API_BASE_URL}/move`, {
      body: JSON.stringify({ files: body.files }),
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to move cloud files.' },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: 'Unable to connect to cloud storage.' },
      { status: 502 },
    );
  }
}
