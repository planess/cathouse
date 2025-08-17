'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@app/components/button';
import { encrypt } from '@app/helpers/encrypt-browser';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';

import FormField from '../../../components/form-field/form-field';
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
    return <div className="text-3xl text-center">{t('internalError')}</div>;
  }

  const onSubmit = handleSubmit(async ({ password, identifier }) => {
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

        router.push('/signin');
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
    <form className="flex flex-col gap-2" onSubmit={silentSubmit}>
      <div>
        <FormField
          label={t('form.label.email')}
          element="input"
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
      </div>

      <div>
        <FormField
          label={t('form.label.password')}
          element="input"
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
      </div>

      {/* Root error display */}
      {formState.errors.root && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
          {formState.errors.root.message as string}
        </div>
      )}

      <Button
        disabled={isLoading || !formState.isValid || !cryptoKey}
        pending={pending}
        className="mt-4 ml-auto"
      >
        {t('form.label.register-button')}
      </Button>
    </form>
  );
}
