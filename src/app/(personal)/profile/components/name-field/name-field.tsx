'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState, useTransition } from 'react';

import { updateName } from '../../actions/update-name';
import type { NameFieldProps } from '../../models/name-field-props';
import { FIRST_NAME_MIN_LENGTH } from '../../models/profile-field-limits';
import EditSaveButton from '../edit-save-button/edit-save-button';

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50';

/**
 * Name of the user with editing of the required first name and optional last name.
 *
 * @param props - Field props.
 * @param props.firstName - Saved first name.
 * @param props.lastName - Saved last name.
 */
export default function NameField({ firstName, lastName }: NameFieldProps) {
  const t = useTranslations('profilepage');
  const [isEditing, setIsEditing] = useState(false);
  const [first, setFirst] = useState(firstName ?? '');
  const [last, setLast] = useState(lastName ?? '');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const isDirty =
    first.trim() !== (firstName ?? '') || last.trim() !== (lastName ?? '');
  const canSave = first.trim().length >= FIRST_NAME_MIN_LENGTH;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  // Hint about the length only after the user has changed the value
  const firstNameErrors =
    isDirty && !canSave
      ? [t('edit.error.firstName', { n: FIRST_NAME_MIN_LENGTH })]
      : (errors.firstName ?? []);

  const cancel = () => {
    setFirst(firstName ?? '');
    setLast(lastName ?? '');
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
      const response = await updateName(first, last);

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
          <div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1 text-xs text-slate-500 dark:text-stone-400">
              {t('personal.firstName')}
              <input
                autoComplete="given-name"
                className={inputClassName}
                minLength={FIRST_NAME_MIN_LENGTH}
                onChange={(event) => setFirst(event.target.value)}
                required
                value={first}
              />
              {firstNameErrors.map((message) => (
                <span className="text-red-600 dark:text-red-400" key={message}>
                  {message}
                </span>
              ))}
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-slate-500 dark:text-stone-400">
              {t('personal.lastName')}
              <input
                autoComplete="family-name"
                className={inputClassName}
                onChange={(event) => setLast(event.target.value)}
                value={last}
              />
            </label>
          </div>
        ) : (
          <span className="py-1">{fullName || t('personal.empty')}</span>
        )}
        <EditSaveButton
          canSave={canSave}
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
