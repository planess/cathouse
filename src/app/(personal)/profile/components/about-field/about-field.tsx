'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState, useTransition } from 'react';

import { updateAbout } from '../../actions/update-about';
import type { AboutFieldProps } from '../../models/about-field-props';
import { ABOUT_MAX_LENGTH } from '../../models/profile-field-limits';
import EditSaveButton from '../edit-save-button/edit-save-button';

/**
 * Volunteer "about" text with editing in a textarea.
 *
 * @param props - Field props.
 * @param props.about - Saved "about" text.
 */
export default function AboutField({ about }: AboutFieldProps) {
  const t = useTranslations('profilepage');
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(about ?? '');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const isDirty = value.trim() !== (about ?? '');
  const canSave = value.trim().length <= ABOUT_MAX_LENGTH;

  const cancel = () => {
    setValue(about ?? '');
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Nothing changed: leave edit mode without a request
    if (!isDirty) {
      cancel();
      return;
    }

    if (!canSave) {
      return;
    }

    startTransition(async () => {
      const response = await updateAbout(value);

      if (response.status === 'ok') {
        setErrors({});
        setIsEditing(false);
      } else {
        setErrors(response.errors ?? { root: [t('edit.error.common')] });
      }
    });
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-3">
        {isEditing ? (
          <textarea
            aria-label={t('volunteer.about')}
            className="min-h-32 w-full min-w-0 flex-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50"
            maxLength={ABOUT_MAX_LENGTH}
            onChange={(event) => setValue(event.target.value)}
            value={value}
          />
        ) : (
          <p className="whitespace-pre-line py-1">
            {about || t('personal.empty')}
          </p>
        )}
        <EditSaveButton
          canSave={canSave}
          isEditing={isEditing}
          onCancel={cancel}
          onEdit={() => setIsEditing(true)}
          pending={pending}
        />
      </div>
      {[...(errors.about ?? []), ...(errors.root ?? [])].map((message) => (
        <p
          className="text-xs text-red-600 dark:text-red-400"
          key={message}
          role="alert"
        >
          {message}
        </p>
      ))}
    </form>
  );
}
