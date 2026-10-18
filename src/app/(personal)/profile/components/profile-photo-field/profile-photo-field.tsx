'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useRef, useState, useTransition } from 'react';

import { uploadProfilePhoto } from '@app/helpers/upload-profile-photo';
import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TYPES,
} from '@app/models/profile-photo-limits';

import type { ProfilePhotoFieldProps } from '../../models/profile-photo-field-props';

/**
 * Volunteer profile photo preview (up to 100px) with a "Replace" link that
 * opens the file picker and uploads the selected .png or .jpg file straight
 * to R2 through a presigned URL.
 *
 * @param props - Field props.
 * @param props.photoUrl - Public URL of the current photo, or `null`.
 */
export default function ProfilePhotoField({ photoUrl }: ProfilePhotoFieldProps) {
  const t = useTranslations('profilepage');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after an error
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      setError(t('volunteer.photoError.type'));
      return;
    }

    if (file.size > PROFILE_PHOTO_MAX_BYTES) {
      setError(
        t('volunteer.photoError.size', {
          n: PROFILE_PHOTO_MAX_BYTES / 1024 / 1024,
        }),
      );
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await uploadProfilePhoto('/api/profile/photo', file);

      if (result.success) {
        router.refresh();
      } else {
        setError(
          result.error === 'type' || result.error === 'size'
            ? t(`volunteer.photoError.${result.error}`, {
                n: PROFILE_PHOTO_MAX_BYTES / 1024 / 1024,
              })
            : t('edit.error.common'),
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={t('volunteer.photo')}
            className="max-h-[100px] max-w-[100px] rounded-lg object-contain"
            src={photoUrl}
          />
        ) : (
          <span>{t('personal.empty')}</span>
        )}
        <button
          className="font-semibold text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline dark:text-emerald-300"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {pending ? t('volunteer.photoUploading') : t('volunteer.photoReplace')}
        </button>
        <input
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          className="hidden"
          onChange={handleChange}
          ref={inputRef}
          type="file"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
