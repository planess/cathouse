import { getSafeMediaPath } from './get-safe-media-path';

export function isSafeMediaFilePath(path: unknown): path is string {
  return typeof path === 'string' && getSafeMediaPath(path) !== null;
}
