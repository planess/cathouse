import type { InventoryTransactionMediaRow } from '../../types/inventory.types';

type TransactionMediaKind = 'image' | 'video' | 'document';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];

function hasKnownExtension(value: string, extensions: string[]): boolean {
  if (value.length === 0) {
    return false;
  }

  const normalized = value.toLowerCase();

  return extensions.some((extension) =>
    normalized.endsWith(`.${extension}`),
  );
}

export function resolveTransactionMediaKind(
  media: InventoryTransactionMediaRow,
): TransactionMediaKind {
  const mimeType = media.mimeType?.toLowerCase() ?? '';

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  const originalName = media.originalName?.trim().toLowerCase() ?? '';
  const urlPath = media.url.split('?')[0]?.toLowerCase() ?? '';

  if (
    hasKnownExtension(originalName, IMAGE_EXTENSIONS) ||
    hasKnownExtension(urlPath, IMAGE_EXTENSIONS)
  ) {
    return 'image';
  }

  if (
    hasKnownExtension(originalName, VIDEO_EXTENSIONS) ||
    hasKnownExtension(urlPath, VIDEO_EXTENSIONS)
  ) {
    return 'video';
  }

  return 'document';
}

export function resolveTransactionMediaLabel(
  media: InventoryTransactionMediaRow,
  fallbackIndex: number,
): string {
  const originalName = media.originalName?.trim() ?? '';

  if (originalName.length > 0) {
    return originalName;
  }

  const key = media.key.trim();

  if (key.length > 0) {
    return key;
  }

  return `File ${fallbackIndex}`;
}
