'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { requestKeyGeneration } from '@app/helpers/request-key-generation';
import { useCryptoKeysError } from '@app/hooks/use-crypto-keys';
import { HandlerParams } from '@app/models/handler-params.server';

import AuthAlert from '../../components/auth-alert/auth-alert';

import AuthForm from './auth-form';

export default function AuthFormWrapper({ handler }: HandlerParams<string>) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const cryptoError = useCryptoKeysError();

  const middleHandler = useCallback(
    async (email: string) => {
      const result = await handler(email);

      if (result.status === 'ok') {
        setSent(true);
        setEmail(email);
      }

      return result;
    },
    [handler],
  );

  return (
    <>
      {sent && (
        <AuthAlert tone="success">
          <p className="m-0">
            Лист надіслано на <b>{email}</b>, перевірте свою пошту!
          </p>

          <Link
            className="self-start font-semibold text-sky-700 dark:text-sky-400 hover:text-slate-900 dark:hover:text-stone-50"
            href="#"
            onClick={() => setSent(false)}
          >
            Edit email
          </Link>
        </AuthAlert>
      )}

      {!sent && <AuthForm handler={middleHandler} />}

      {process.env.NODE_ENV === 'development' && cryptoError && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              void requestKeyGeneration();
            }}
            className="px-4 py-2 rounded-lg border border-sky-700 text-sm font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-stone-800 cursor-pointer disabled:opacity-50"
          >
            Generate Crypto Key
          </button>
        </div>
      )}
    </>
  );
}
