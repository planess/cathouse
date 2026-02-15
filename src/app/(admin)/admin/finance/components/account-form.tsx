import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { validateAccountForm } from '../helpers/validate-account-form';
import { AccountFormState } from '../models/account-form-state';

import { IbanInput } from './iban-input';

export default function AccountForm({
  initialState,
  onChange,
  onValidityChange,
}: {
  initialState: AccountFormState;
  onChange: (state: AccountFormState) => void;
  onValidityChange: (isValid: boolean) => void;
}) {
  const t = useTranslations('adminFinance');
  const [formState, setFormState] = useState<AccountFormState>(initialState);
  const [touched, setTouched] = useState({ name: false, iban: false });

  const errors = validateAccountForm(formState, t);
  const isValid = Object.keys(errors).length === 0;
  const nameError = touched.name ? (errors.name ?? '') : '';
  const ibanError = touched.iban ? (errors.iban ?? '') : '';

  const updateState = (nextState: AccountFormState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(
      Object.keys(validateAccountForm(nextState, t)).length === 0,
    );
  };

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('forms.account.nameLabel')}
        </label>
        <input
          className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
            nameError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
          }`}
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          type="text"
          placeholder={t('forms.account.namePlaceholder')}
        />
        {nameError ? (
          <p className="text-xs text-rose-500">{nameError}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <IbanInput
          label={t('forms.account.ibanLabel')}
          value={formState.iban}
          onChange={(value) => updateState({ ...formState, iban: value })}
          onBlur={() => setTouched((current) => ({ ...current, iban: true }))}
          isInvalid={Boolean(ibanError)}
        />
        {ibanError ? (
          <p className="text-xs text-rose-500">{ibanError}</p>
        ) : null}
      </div>
      {!isValid && (touched.name || touched.iban) ? (
        <p className="text-xs text-slate-500">
          {t('forms.account.requiredHint')}
        </p>
      ) : null}
    </form>
  );
}
