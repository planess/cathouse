'use client';

import { redirect, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { encrypt } from '@app/helpers/encrypt-browser';
import { formatDuration } from '@app/helpers/format-duration';
import { useCryptoKeys } from '@app/hooks/use-crypto-keys';

import AuthInputField from '../../components/auth-input-field/auth-input-field';
import AuthSubmitButton from '../../components/auth-submit-button/auth-submit-button';
import { ServerFormData } from '../../models/server-form-data';
import { changePassword } from '../server/change-password';

interface RestoreFormProps {
  expiresIn: Date;
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
  const [left, setLeft] = useState(
    Math.floor((expiresIn.getTime() - Date.now()) / 1000),
  );
  const { cryptoKey } = useCryptoKeys();
  const [pending, setPending] = useState(false);
  const t = useTranslations('authorization');

  useEffect(() => {
    const interval = setInterval(() => {
      setLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresIn, setLeft]);

  useEffect(() => {
    if (left <= 0) {
      redirect('/reset-password');
    }
  }, [left]);

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!cryptoKey || pending) {
      return;
    }
    setPending(true);
    // keep the spinner on until the redirect after a successful submit
    let redirecting = false;

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

        redirecting = true;
        router.push('/signin');
      }
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      if (!redirecting) {
        setPending(false);
      }
    }
  });

  const silentSubmit = (event: FormEvent) => void onSubmit(event);

  return (
    <form
      onSubmit={silentSubmit}
      className="flex grow flex-col gap-[18px] lg:gap-5"
    >
      <AuthInputField
        label="New Password"
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

      <p className="m-0 text-sm text-slate-600 dark:text-stone-300">
        You have only{' '}
        <strong className="font-semibold text-slate-900 dark:text-stone-50">
          {formatDuration(left)}
        </strong>{' '}
        to change your password.
      </p>

      <div className="grow lg:hidden" />

      <AuthSubmitButton
        pending={pending}
        disabled={!formState.isValid || !cryptoKey || pending}
      >
        Change password
      </AuthSubmitButton>
    </form>
  );
}
