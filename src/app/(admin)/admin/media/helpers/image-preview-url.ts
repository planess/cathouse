export function imagePreviewUrl(path: string, width = 300) {
  const baseUrl = process.env.NEXT_PUBLIC_R2_MEDIA_BASE_URL;

  if (baseUrl === undefined || baseUrl === '') {
    throw new Error('NEXT_PUBLIC_R2_MEDIA_BASE_URL is not configured.');
  }

  const encodedPath = path.split('/').map(encodeURIComponent).join('/');

  return `${baseUrl.replace(/\/$/, '')}/thumb/${encodedPath}?width=${width}`;
}
