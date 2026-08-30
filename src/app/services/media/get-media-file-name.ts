export function getMediaFileName(path: string): string {
  return path.split('/').at(-1) ?? 'download';
}
