export function imagePreviewUrl(path: string, width = 300) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');

  return `https://r2.lairlines.com/thumb/${encodedPath}`;
}
