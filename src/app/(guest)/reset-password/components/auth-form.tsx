'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import { HandlerParams } from '@app/models/handler-params.server';

import AuthInputField from '../../components/auth-input-field/auth-input-field';
import AuthSubmitButton from '../../components/auth-submit-button/auth-submit-button';

interface FormData {
  identifier: string;
}

export default function AuthForm({ handler }: HandlerParams<string>) {
  const t = useTranslations('authorization');
  const [pending, setPending] = useState(false);
  const { register, handleSubmit, formState, clearErrors, reset } =
    useForm<FormData>({ criteriaMode: 'all' });

  const onSubmit = handleSubmit(async (args) => {
    if (!formState.isValid) {
      return;
    }

    const response = await handler(args.identifier);

    if (response.status === 'ok') {
      reset();
      clearErrors();
    } else {
      setPending(false);
      // setError('identifier', { type: 'manual', message: response.message });
    }
  });
  const silentSubmit = (event: FormEvent) => {
    if (!pending) {
      setPending(true);

      void onSubmit(event);
    }
  };

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
    <form
      onSubmit={silentSubmit}
      className="flex grow flex-col gap-[18px] lg:gap-5"
    >
      <AuthInputField
        label={t('form.label.email')}
        config={{
          ...register('identifier', { required: true }),
          placeholder: t('form.placeholder.email-reset'),
        }}
        errors={identifierErrors}
      />

      <div className="grow lg:hidden" />

      <AuthSubmitButton disabled={!formState.isValid} pending={pending}>
        {t('form.label.reset-password-button')}
      </AuthSubmitButton>
    </form>
  );
}
