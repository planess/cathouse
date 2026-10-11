'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState, useTransition } from 'react';

import { Sex } from '@app/models/sex';

import { updateSex } from '../../actions/update-sex';
import type { SexFieldProps } from '../../models/sex-field-props';
import EditSaveButton from '../edit-save-button/edit-save-button';

/**
 * Sex of the user with editing as a choice of male or female; once chosen it
 * cannot be cleared.
 *
 * @param props - Field props.
 * @param props.sex - Saved sex, or `null` when it was never chosen.
 */
export default function SexField({ sex }: SexFieldProps) {
  const t = useTranslations('profilepage');
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<Sex | null>(sex);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const isDirty = value !== sex;

  const cancel = () => {
    setValue(sex);
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

    if (value === null) {
      return;
    }

    startTransition(async () => {
      const response = await updateSex(value);

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
          <fieldset className="flex flex-wrap gap-4 py-1">
            <legend className="sr-only">{t('personal.sex')}</legend>
            {Object.values(Sex).map((option) => (
              <label className="flex items-center gap-2" key={option}>
                <input
                  checked={value === option}
                  className="accent-emerald-600"
                  name="sex"
                  onChange={() => setValue(option)}
                  type="radio"
                  value={option}
                />
                {t(`personal.sexOptions.${option}`)}
              </label>
            ))}
          </fieldset>
        ) : (
          <span className="py-1">
            {sex ? t(`personal.sexOptions.${sex}`) : t('personal.empty')}
          </span>
        )}
        <EditSaveButton
          canSave={value !== null}
          isEditing={isEditing}
          onCancel={cancel}
          onEdit={() => setIsEditing(true)}
          pending={pending}
        />
      </div>
      {[...(errors.sex ?? []), ...(errors.root ?? [])].map((message) => (
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
