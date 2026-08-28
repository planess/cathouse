export function isPreviewableFile(fileName: string) {
  const extension = fileName.split('.').at(-1)?.toLowerCase();

  return ['avi', 'jpg', 'mp4', 'png'].includes(extension ?? '');
}
