'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@app/components/button';
import { encrypt } from '@app/helpers/encrypt-browser';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';

import FormField from '../../../components/form-field/form-field';
import { FormData as IAuthForm } from '../../models/form-data';
import { ServerFormData } from '../../models/server-form-data';
import { authenticate } from '../../server/authenticate';

const transformer: Record<string, string> = {
  passHash: 'password',
};

export default function AuthForm() {
  const router = useRouter();
  const t = useTranslations('authorization');
  const { register, handleSubmit, formState, setError, clearErrors, reset } =
    useForm<IAuthForm>({
      criteriaMode: 'all',
    });
  const { cryptoKey, isLoading, error: cryptoError } = useCryptoKeys();
  const [pending, setPending] = useState(false);

  if (cryptoError !== null) {
    return <div className="text-3xl text-center">{t('internalError')}</div>;
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

      const response = await authenticate(formData);

      if (response.status === 'error') {
        for (const skey in response.errors) {
          const rawKey = skey as keyof ServerFormData;
          const key = (transformer[rawKey] ?? rawKey) as keyof IAuthForm;

          setError(key, {
            type: 'manual',
            message: response.errors[rawKey][0],
          });
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

  return (
    <form onSubmit={silentSubmit} className="flex flex-col gap-2">
      <div>
        <FormField
          label={t('form.label.email')}
          element="input"
          config={{
            ...register('identifier', { required: true }),
            placeholder: t('form.placeholder.email'),
          }}
        />
      </div>
      <div>
        <FormField
          label={t('form.label.password')}
          element="input"
          config={{
            ...register('password', { required: true }),
            type: 'password',
            placeholder: t('form.placeholder.auth-password'),
          }}
        />
      </div>

      {/* Root error display */}
      {formState.errors.root && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
          {formState.errors.root.message as string}
        </div>
      )}

      <Button
        className="mt-4 ml-auto"
        pending={pending}
        disabled={isLoading || !formState.isValid || !cryptoKey}
      >
        {t('form.label.auth-button')}
      </Button>
    </form>
  );
}
