'use client';

import { useTranslations } from 'next-intl';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import { createInformator } from '../server/create-informator';

import type { InformatorOption } from '../types';

export type CreateInformatorFormHandle = {
  submit: () => Promise<InformatorOption>;
};

export const CreateInformatorForm = forwardRef<CreateInformatorFormHandle>(
  (_props, ref) => {
    const t = useTranslations('historypage.personal');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = useCallback(async () => {
      setError(null);

      if (!name.trim()) {
        const message = t('form.informator_modal.name_error');
        setError(message);
        throw new Error(message);
      }

      if (!phone.trim()) {
        const message = t('form.informator_modal.phone_error');
        setError(message);
        throw new Error(message);
      }

      const payload = new FormData();
      payload.append('name', name.trim());
      payload.append('phone', phone.trim());

      if (age.trim()) {
        payload.append('age', age.trim());
      }

      setIsSubmitting(true);

      try {
        const response = await createInformator(payload);

        if (!response.success) {
          setError(response.message);
          throw new Error(response.message);
        }

        return {
          value: response.person.id,
          label: response.person.name,
        };
      } finally {
        setIsSubmitting(false);
      }
    }, [age, name, phone, t]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-900 dark:text-slate-300"
            htmlFor="informator-name"
          >
            {t('form.informator_modal.name_label')}
          </label>
          <input
            id="informator-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('form.informator_modal.name_placeholder')}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 dark:bg-stone-700 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('form.informator_modal.name_hint')}
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-900 dark:text-slate-300"
            htmlFor="informator-phone"
          >
            {t('form.informator_modal.phone_label')}
          </label>
          <input
            id="informator-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t('form.informator_modal.phone_placeholder')}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 dark:bg-stone-700 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('form.informator_modal.phone_hint')}
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-900 dark:text-slate-300"
            htmlFor="informator-age"
          >
            {t('form.informator_modal.age_label')}
          </label>
          <input
            id="informator-age"
            type="number"
            min={0}
            max={120}
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder={t('form.informator_modal.age_placeholder')}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 dark:bg-stone-700 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('form.informator_modal.age_hint')}
          </p>
        </div>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {isSubmitting && (
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            {t('form.informator_modal.saving')}
          </p>
        )}
      </div>
    );
  },
);

CreateInformatorForm.displayName = 'CreateInformatorForm';
