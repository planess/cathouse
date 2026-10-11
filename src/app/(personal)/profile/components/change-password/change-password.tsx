'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';

import { encrypt } from '@app/helpers/encrypt-browser';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';

import { changePassword } from '../../actions/change-password';
import { PASSWORD_MIN_LENGTH } from '../../models/password-min-length';

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-600 dark:bg-stone-800';

/**
 * Change password option: a button that opens a form to enter the new
 * password twice, with apply and cancel actions.
 */
export default function ChangePassword() {
  const t = useTranslations('profilepage.security.password');
  const { cryptoKey } = useCryptoKeys();
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const isLongEnough = password.length >= PASSWORD_MIN_LENGTH;
  const isConfirmed = password === confirmation;
  const canApply = isLongEnough && isConfirmed && !!cryptoKey && !pending;

  const reset = () => {
    setIsEditing(false);
    setPassword('');
    setConfirmation('');
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!canApply || !cryptoKey) {
      return;
    }

    setPending(true);
    setErrors({});

    try {
      const [passHash, confirmationHash] = await Promise.all([
        encrypt(cryptoKey, password),
        encrypt(cryptoKey, confirmation),
      ]);
      const response = await changePassword({ passHash, confirmationHash });

      if (response.status === 'ok') {
        reset();
        setIsChanged(true);
      } else {
        setErrors(response.errors ?? { root: [t('error.common')] });
      }
    } catch (error) {
      console.error('Password change request failed', error);
      setErrors({ root: [t('error.common')] });
    } finally {
      setPending(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="text-slate-500 dark:text-stone-400">
            {t('requirements', { n: PASSWORD_MIN_LENGTH })}
          </p>
          {isChanged && (
            <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
              {t('success')}
            </p>
          )}
        </div>
        <button
          className="shrink-0 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
          onClick={() => {
            setIsChanged(false);
            setIsEditing(true);
          }}
          type="button"
        >
          {t('change')}
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <p className="text-sm text-slate-500 dark:text-stone-400">
        {t('requirements', { n: PASSWORD_MIN_LENGTH })}
      </p>

      <label className="flex flex-col gap-1 text-sm">
        {t('newPassword')}
        <input
          autoComplete="new-password"
          className={inputClassName}
          minLength={PASSWORD_MIN_LENGTH}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        {errors.password?.map((message) => (
          <span className="text-xs text-red-600 dark:text-red-400" key={message}>
            {message}
          </span>
        ))}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {t('repeatPassword')}
        <input
          autoComplete="new-password"
          className={inputClassName}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          type="password"
          value={confirmation}
        />
        {(confirmation !== '' && !isConfirmed
          ? [t('error.mismatch')]
          : (errors.confirmation ?? [])
        ).map((message) => (
          <span className="text-xs text-red-600 dark:text-red-400" key={message}>
            {message}
          </span>
        ))}
      </label>

      {errors.root?.map((message) => (
        <p className="text-sm text-red-600 dark:text-red-400" key={message}>
          {message}
        </p>
      ))}

      <div className="flex gap-3">
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          disabled={!canApply}
          type="submit"
        >
          {pending ? t('applying') : t('apply')}
        </button>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          disabled={pending}
          onClick={reset}
          type="button"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
