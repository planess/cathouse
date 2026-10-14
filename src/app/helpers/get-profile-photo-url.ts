/**
 * Builds the public URL of a profile photo stored in R2. Server-only: reads
 * `CLOUDFLARE_R2_ANIMAL_IMAGE_URL`.
 *
 * @param profilePhoto - `profiles.profilePhoto` value: an R2 key or an absolute URL.
 * @returns Photo URL, or `null` when there is no photo or no R2 base URL.
 */
export function getProfilePhotoUrl(
  profilePhoto: string | null | undefined,
): string | null {
  const imageBaseUrl = process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL;
  const normalizedProfilePhoto = profilePhoto?.trim() ?? '';

  if (imageBaseUrl === undefined || normalizedProfilePhoto === '') {
    return null;
  }

  if (/^https?:\/\//i.test(normalizedProfilePhoto)) {
    return normalizedProfilePhoto;
  }

  return `${imageBaseUrl.replace(/\/$/, '')}/${normalizedProfilePhoto.replace(
    /^\//,
    '',
  )}`;
}
