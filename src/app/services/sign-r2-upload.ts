import type { SignedR2Upload } from '@app/models/signed-r2-upload';

/** Lifetime of a presigned upload URL, in seconds. */
const UPLOAD_URL_EXPIRES_IN_SECONDS = 300;

/**
 * Requests a presigned `PUT` URL from the media worker for uploading a file
 * straight into the R2 bucket. Server-only: reads `R2_MEDIA_BASE_URL`.
 *
 * @param path - R2 key to upload the file to.
 * @param contentType - MIME type the upload is locked to.
 * @returns The presigned upload.
 * @throws When the worker is unreachable or refuses to sign.
 */
export async function signR2Upload(
  path: string,
  contentType: string,
): Promise<SignedR2Upload> {
  const response = await fetch(
    `${process.env.R2_MEDIA_BASE_URL}/sign-r2?expiresInSeconds=${UPLOAD_URL_EXPIRES_IN_SECONDS}`,
    {
      body: JSON.stringify({ files: [{ path, contentType }] }),
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to sign an R2 upload: ${response.status} ${await response.text()}`,
    );
  }

  const { files } = (await response.json()) as { files: SignedR2Upload[] };
  const signedUpload = files.find((file) => file.path === path);

  if (!signedUpload) {
    throw new Error(`No upload URL was returned for ${path}.`);
  }

  return signedUpload;
}
