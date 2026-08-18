export function normalizeFolderPath(path: string): string {
  return path.replaceAll(/^\/+|\/+$/g, '');
}
