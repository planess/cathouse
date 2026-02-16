'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { requestKeyGeneration } from '@app/helpers/request-key-generation';
import { useCryptoKeysError } from '@app/hooks/use-crypto-keys';
import { HandlerParams } from '@app/models/handler-params.server';

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
        <>
          <div className="lg:w-120 mx-auto my-4 bg-slate-100 rounded-md text-amber-800 p-4">
            <p>
              Лист надіслано на <b>{email}</b>, перевірте свою пошту!
            </p>

            <Link
              className="text-sky-600"
              href="#"
              onClick={() => setSent(false)}
            >
              Edit email
            </Link>
          </div>
        </>
      )}

      {!sent && <AuthForm handler={middleHandler} />}

      {process.env.NODE_ENV === 'development' && cryptoError && (
        <div>
          <button
            onClick={() => {
              void requestKeyGeneration();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Crypto Key
          </button>
        </div>
      )}
    </>
  );
}
