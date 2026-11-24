/** Headers the browser sets itself and refuses to accept from scripts. */
const BROWSER_CONTROLLED_HEADERS = new Set(['content-length', 'host']);

/**
 * Uploads a file to a presigned URL with a `PUT` request and reports progress.
 *
 * @param file - File to upload.
 * @param url - Presigned upload URL.
 * @param onProgress - Called with the upload progress as a percentage from 0 to 100.
 * @param headers - Headers that were signed together with the URL, such as `x-amz-meta-*` metadata.
 * @returns A promise that resolves when the storage accepts the file.
 */
export function uploadFile(
  file: File,
  url: string,
  onProgress: (progress: number) => void,
  headers: Record<string, string> = {},
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

    for (const [name, value] of Object.entries(headers)) {
      if (!BROWSER_CONTROLLED_HEADERS.has(name.toLowerCase())) {
        request.setRequestHeader(name, value);
      }
    }

    request.send(file);
  });
}
