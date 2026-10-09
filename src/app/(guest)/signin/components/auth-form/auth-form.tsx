'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import { EyeIcon } from '@app/components/icons/eye-icon';
import { EyeOffIcon } from '@app/components/icons/eye-off-icon';
import { encrypt } from '@app/helpers/encrypt-browser';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

import AuthAlert from '../../../components/auth-alert/auth-alert';
import AuthCard from '../../../components/auth-card/auth-card';
import AuthInputField from '../../../components/auth-input-field/auth-input-field';
import AuthSubmitButton from '../../../components/auth-submit-button/auth-submit-button';
import { ServerFormData } from '../../../models/server-form-data';
import { FormData as IAuthForm } from '../../models/form-data';


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
      <AuthCard title={t('title.auth')}>
        <AuthAlert tone="error">{t('internalError')}</AuthAlert>
      </AuthCard>
    );
  }

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    // formality, submit button is not active until 'cryptoKey' is null
    if (!cryptoKey) {
      return;
    }

    setPending(true);
    // keep the spinner on until the redirect after a successful submit
    let redirecting = false;

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

        redirecting = true;
        router.push('/');
      }
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error ? error.message : t('form.validation.unknown'),
      });
    } finally {
      if (!redirecting) {
        setPending(false);
      }
    }
  });

  const silentSubmit = (event: FormEvent) => void onSubmit(event);
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
    <AuthCard title={t('title.auth')}>
      <form
        onSubmit={silentSubmit}
        className="flex grow flex-col gap-[18px] lg:gap-5"
      >
        {/* Root error display */}
        {formState.errors.root && (
          <AuthAlert tone="error">
            {formState.errors.root.message as string}
          </AuthAlert>
        )}

        <AuthInputField
          label={t('form.label.email')}
          config={{
            ...register('identifier', { required: true }),
            placeholder: 'name@example.com',
            autoComplete: 'username',
          }}
          errors={fieldErrors(formState.errors.identifier?.message)}
        />

        <div className="flex flex-col">
          <AuthInputField
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

        <AuthSubmitButton
          pending={pending}
          disabled={isLoading || !formState.isValid || !cryptoKey}
        >
          {t('form.label.auth-button')}
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
