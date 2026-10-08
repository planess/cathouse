'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AlertCircleIcon } from '@app/components/icons/alert-circle-icon';
import { EyeIcon } from '@app/components/icons/eye-icon';
import { EyeOffIcon } from '@app/components/icons/eye-off-icon';
import { encrypt } from '@app/helpers/encrypt-browser';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

import { ServerFormData } from '../../../models/server-form-data';
import { FormData as IAuthForm } from '../../models/form-data';
import SigninInputField from '../signin-input-field/signin-input-field';

const transformer: Record<string, string> = {
  passHash: 'password',
};

const fieldErrors = (message?: string) => (message ? [message] : undefined);

export default function AuthForm() {
  const router = useRouter();
  const t = useTranslations('authorization');
  const { register, handleSubmit, formState, setError, clearErrors, reset } =
    useForm<IAuthForm>({
      criteriaMode: 'all',
    });
  const { cryptoKey, isLoading, error: cryptoError } = useCryptoKeys();
  const [pending, setPending] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  if (cryptoError !== null) {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-white dark:bg-stone-900 p-8 text-center text-lg font-semibold"
      >
        {t('internalError')}
      </div>
    );
  }

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    // formality, submit button is not active until 'cryptoKey' is null
    if (!cryptoKey) {
      return;
    }

    setPending(true);

    try {
      const passHash = await encrypt(cryptoKey, password);
      const formData: ServerFormData = {
        identifier,
        passHash,
      };

      const apiResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const response = (await apiResponse.json()) as ServerActionResponse;

      if (response.status === 'error') {
        for (const skey in response.errors ?? {}) {
          const rawKey = skey as keyof ServerFormData;
          const key = (transformer[rawKey] ?? rawKey) as keyof IAuthForm;

          if (response.errors?.[rawKey]?.[0]) {
            setError(key, {
              type: 'manual',
              message: response.errors[rawKey][0],
            });
          }
        }
      } else {
        clearErrors();
        reset();

        router.push('/');
      }
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error ? error.message : t('form.validation.unknown'),
      });
    } finally {
      setPending(false);
    }
  });

  const silentSubmit = (event: FormEvent) => void onSubmit(event);
  const submitDisabled =
    pending || isLoading || !formState.isValid || !cryptoKey;
  const forgotPasswordLink = (className: string) => (
    <Link
      href="/reset-password"
      className={clsx(
        'text-sm font-semibold text-sky-700 dark:text-sky-400 hover:text-slate-900 dark:hover:text-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
        className,
      )}
    >
      {t('form.label.forgot-password')}
    </Link>
  );

  return (
    <form
      onSubmit={silentSubmit}
      className="flex grow flex-col gap-[18px] lg:grow-0 lg:gap-5 rounded-t-3xl lg:rounded-2xl bg-white dark:bg-stone-900 px-6 pt-7 pb-6 lg:p-8 lg:border lg:border-slate-200 lg:dark:border-stone-700 lg:shadow-xs"
    >
      <h2 className="m-0 text-2xl leading-[30px] lg:text-3xl lg:leading-9 font-extrabold">
        {t('title.auth')}
      </h2>

      {/* Root error display */}
      {formState.errors.root && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-700 dark:text-rose-300"
        >
          <AlertCircleIcon width={20} height={20} className="shrink-0" />
          <span>{formState.errors.root.message as string}</span>
        </div>
      )}

      <SigninInputField
        label={t('form.label.email')}
        config={{
          ...register('identifier', { required: true }),
          placeholder: 'name@example.com',
          autoComplete: 'username',
        }}
        errors={fieldErrors(formState.errors.identifier?.message)}
      />

      <div className="flex flex-col">
        <SigninInputField
          label={t('form.label.password')}
          labelAside={forgotPasswordLink('hidden lg:inline')}
          config={{
            ...register('password', { required: true }),
            type: passwordVisible ? 'text' : 'password',
            placeholder: t('form.placeholder.auth-password'),
            autoComplete: 'current-password',
          }}
          errors={fieldErrors(formState.errors.password?.message)}
          trailing={
            <button
              type="button"
              aria-label={
                passwordVisible
                  ? t('form.label.hide-password')
                  : t('form.label.show-password')
              }
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible((visible) => !visible)}
              className="absolute top-0.5 right-0.5 lg:top-0 lg:right-0 flex size-11 items-center justify-center rounded-md text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              {passwordVisible ? (
                <EyeOffIcon width={20} height={20} />
              ) : (
                <EyeIcon width={20} height={20} />
              )}
            </button>
          }
        />

        {forgotPasswordLink('self-end py-2 lg:hidden')}
      </div>

      {/* Visual only: session persistence is not configurable yet */}
      <label className="flex items-center gap-2.5 min-h-11 lg:min-h-6 text-sm text-slate-600 dark:text-stone-300 cursor-pointer">
        <input
          type="checkbox"
          name="remember"
          className="m-0 size-5 lg:size-[18px] accent-sky-700 cursor-pointer"
        />
        <span className="lg:hidden">{t('form.label.remember-me')}</span>
        <span className="hidden lg:inline">
          {t('form.label.remember-me-device')}
        </span>
      </label>

      <div className="grow lg:hidden" />

      <button
        type="submit"
        disabled={submitDisabled}
        className={clsx(
          'h-13 lg:h-12 rounded-lg text-base font-semibold shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
          pending && 'animate-pulse',
          submitDisabled
            ? 'bg-slate-200 dark:bg-stone-700 text-slate-400 dark:text-stone-400 shadow-none cursor-not-allowed'
            : 'bg-sky-700 text-white hover:bg-sky-800 active:bg-sky-900 cursor-pointer',
        )}
      >
        {t('form.label.auth-button')}
      </button>
    </form>
  );
}
