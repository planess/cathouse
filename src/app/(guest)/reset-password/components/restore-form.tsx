'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@app/components/button';
import { encrypt } from '@app/helpers/encrypt-browser';
import { formatDuration } from '@app/helpers/format-duration';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';

import FormField from '../../components/form-field/form-field';
import { ServerFormData } from '../../models/server-form-data';
import { changePassword } from '../server/change-password';
import { useTranslations } from 'next-intl';

interface RestoreFormProps {
  expiresIn: Date | null;
  code: string;
}

interface FormData {
  password: string;
}

const transformer: Record<string, string> = {
  passHash: 'password',
};

export default function RestoreForm({ expiresIn, code }: RestoreFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setError, reset, formState, clearErrors } =
    useForm<FormData>({ criteriaMode: 'all' });
  const [left, setLeft] = useState(0);
  const { cryptoKey, isLoading, error: cryptoError } = useCryptoKeys();
  const [pending, setPending] = useState(false);
  const t = useTranslations('authorization');

  useEffect(() => {
    setLeft(Math.floor((expiresIn.getTime() - Date.now()) / 1000));

    const interval = setInterval(() => {
      setLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresIn, setLeft]);

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!cryptoKey || pending) {
      return;
    }
    setPending(true);

    try {
      const passHash = await encrypt(cryptoKey, password);

      const response = await changePassword(code, passHash);

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
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setPending(false);
    }
  });

  const silentSubmit = (event: FormEvent) => void onSubmit(event);

  return (
    <div>
      <form onSubmit={silentSubmit} className="flex flex-col gap-4">
        <div>
          <FormField
            label="New Password"
            element="input"
            config={{
              ...register('password', { required: true, minLength: 6 }),
              placeholder: 'Enter new password',

            }}
            hint={t('form.hint.password', { n: 6 })}
            errors={
              formState.errors.password?.message !== undefined
                ? [formState.errors.password.message]
                : []
            }
          />
        </div>

        <div>
          You have only <strong>{formatDuration(left)}</strong> to change your
          password.
        </div>

        {/* <div>{formState.errors ? JSON.stringify(formState.errors?.password) : null}</div> */}

        <Button
          className="mt-4 ml-auto"
          pending={pending}
          disabled={!formState.isValid || !cryptoKey || pending}
        >
          Change password
        </Button>
      </form>
    </div>
  );
}
