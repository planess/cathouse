'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState, useTransition } from 'react';

import { updatePhone } from '../../actions/update-phone';
import type { PhoneFieldProps } from '../../models/phone-field-props';
import EditSaveButton from '../edit-save-button/edit-save-button';

/**
 * Phone number of the user with editing as a plain text line.
 *
 * @param props - Field props.
 * @param props.phone - Saved phone number.
 */
export default function PhoneField({ phone }: PhoneFieldProps) {
  const t = useTranslations('profilepage');
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(phone ?? '');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const isDirty = value.trim() !== (phone ?? '');

  const cancel = () => {
    setValue(phone ?? '');
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

    startTransition(async () => {
      const response = await updatePhone(value);

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
          <input
            aria-label={t('personal.phone')}
            autoComplete="tel"
            className="w-full min-w-0 flex-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50"
            onChange={(event) => setValue(event.target.value)}
            type="tel"
            value={value}
          />
        ) : (
          <span className="py-1">{phone || t('personal.empty')}</span>
        )}
        <EditSaveButton
          canSave
          isEditing={isEditing}
          onCancel={cancel}
          onEdit={() => setIsEditing(true)}
          pending={pending}
        />
      </div>
      {errors.root?.map((message) => (
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
