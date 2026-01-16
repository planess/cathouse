'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@app/components/button';
import { HandlerParams } from '@app/models/handler-params.server';

import InputField from '../../components/input-field/input-field';

interface FormData {
  identifier: string;
}

export default function AuthForm({ handler }: HandlerParams<string>) {
  const t = useTranslations('authorization');
  const { register, handleSubmit, formState, setError, clearErrors, reset } = useForm<FormData>({ criteriaMode: 'all'});

  const onSubmit = handleSubmit(async (args) => {

    if (!formState.isValid) {
      return;
    }
    
    const response = await handler(args.identifier);

    if (response.status === 'ok') {
      reset();
      clearErrors();
    } else {
      
      // setError('identifier', { type: 'manual', message: response.message });
    }
  });
  const silentSubmit = (event: FormEvent) => void onSubmit(event);

  const identifierErrors: string[] = (() => {
    if (!('identifier' in formState.errors)) {
      return [];
    }

    const error = formState.errors.identifier;

    if (typeof error?.message === 'string' && error.message.length > 0) {
      return [error.message];
    }

    if (error?.type) {
      return [t(`form.error.${error.type}`)];
    }

    return [];
  })();

  return (
    <form onSubmit={silentSubmit} className="flex flex-col gap-2">
      <div>
        <InputField
          label={t('form.label.email')}
          element="input"
          config={{
            ...register('identifier', { required: true }),
            placeholder: t('form.placeholder.email-reset'),
          }}
          errors={identifierErrors}
         
        />
      </div>

      <Button className="mt-4 ml-auto" disabled={!formState.isValid}>{t('form.label.reset-password-button')}</Button>
    </form>
  );
}
