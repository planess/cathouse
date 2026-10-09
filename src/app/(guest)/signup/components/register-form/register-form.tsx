'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import { encrypt } from '@app/helpers/encrypt-browser';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';

import AuthAlert from '../../../components/auth-alert/auth-alert';
import AuthCard from '../../../components/auth-card/auth-card';
import AuthInputField from '../../../components/auth-input-field/auth-input-field';
import AuthSubmitButton from '../../../components/auth-submit-button/auth-submit-button';
import { FormData } from '../../models/form-data';
import { ServerFormData } from '../../models/server-form-data';
import { register as handler } from '../../server/register';

const transformer: Record<string, string> = {
  passHash: 'password',
};

export default function RegisterForm() {
  const router = useRouter();
  const t = useTranslations('authorization');
  const { register, formState, handleSubmit, setError, clearErrors, reset } =
    useForm<FormData>({
      criteriaMode: 'all',
    });
  const { cryptoKey, isLoading, error: cryptoError } = useCryptoKeys();
  const [pending, setPending] = useState(false);

  if (cryptoError !== null) {
    return (
      <AuthCard title={t('title.register')}>
        <AuthAlert tone="error">{t('internalError')}</AuthAlert>
      </AuthCard>
    );
  }

  const onSubmit = handleSubmit(async ({ password, identifier }) => {
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

      const response = await handler(formData);

      if (response.status === 'error') {
        for (const skey in response.errors) {
          const rawKey = skey as keyof ServerFormData;
          const key = (transformer[rawKey] ?? rawKey) as keyof FormData;

          setError(key, {
            type: 'manual',
            message: response.errors[rawKey][0],
          });
        }
      } else {
        clearErrors();
        reset();

        redirecting = true;
        router.push('/signin');
      }
    } catch (error) {
      console.error('Registration request failed', error);

      setError('root', { message: t('saveUserErrorCommon') });
    } finally {
      if (!redirecting) {
        setPending(false);
      }
    }
  });

  const silentSubmit = (event: FormEvent) => void onSubmit(event);

  return (
    <AuthCard title={t('title.register')}>
      <AuthAlert tone="info">{t('notice.chooseDirection')}</AuthAlert>

      <form
        className="flex grow flex-col gap-[18px] lg:gap-5"
        onSubmit={silentSubmit}
      >
        <AuthInputField
          label={t('form.label.email')}
          config={{
            ...register('identifier', { required: true }),
            placeholder: t('form.placeholder.email'),
          }}
          errors={
            formState.errors.identifier?.message !== undefined
              ? [formState.errors.identifier.message]
              : []
          }
        />

        <AuthInputField
          label={t('form.label.password')}
          config={{
            ...register('password', {
              required: true,
              minLength: 6,
            }),
            type: 'password',
            placeholder: t('form.placeholder.password'),
          }}
          hint={t('form.hint.password', { n: 6 })}
          errors={
            formState.errors.password?.message !== undefined
              ? [formState.errors.password.message]
              : []
          }
        />

        {/* Root error display */}
        {formState.errors.root && (
          <AuthAlert tone="error">
            {formState.errors.root.message as string}
          </AuthAlert>
        )}

        <div className="grow lg:hidden" />

        <AuthSubmitButton
          disabled={isLoading || !formState.isValid || !cryptoKey}
          pending={pending}
        >
          {t('form.label.register-button')}
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
