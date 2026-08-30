export function uploadFile(
  file: File,
  url: string,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener('error', () =>
      reject(new Error('Upload failed.')),
    );
    request.addEventListener('abort', () =>
      reject(new Error('Upload cancelled.')),
    );
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${request.status}.`));
      }
    });
    request.open('PUT', url);
    request.send(file);
  });
}
