export function imagePreviewUrl(path: string, width = 300) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');

  return `${process.env.R2_MEDIA_BASE_URL}/thumb/${encodedPath}?width=${width}`;
}
