'use client';

import { JSX, useState } from 'react';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '@app/components/button';

import { ContactFormData } from '../../models/contact-form-data';

export default function ContactForm({
  handler,
}: {
  handler: (data: ContactFormData) => Promise<{ status: string }>;
}) {
  const { register, handleSubmit, formState, getValues } =
    useForm<ContactFormData>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const http = handleSubmit(async (data) => {
    const response = await handler(data);

    if (response.status === 'ok') {
      setSent(true);
    } else {
      // handle an error
    }
  });

  const handleForm = async (e: React.FormEvent) => {
    setLoading(true);

    try {
      await http(e);
    } finally {
      setLoading(false);
    }
  };

  const a = (data: React.FormEvent) => {
    void handleForm(data);
  };

  return (
    <form onSubmit={a} className="flex flex-col gap-1">
      <div className="flex flex-col">
        <Field
          label="Ім'я"
          element="input"
          config={{
            ...register('name', { required: true }),
            type: 'text',
            placeholder: 'Будемо знати як звертатись при зустрічі',
            disabled: sent,
          }}
        />
      </div>
      <div className="flex flex-col">
        <Field
          label="Email або телефон"
          element="input"
          config={{
            ...register('contacts', { required: true }),
            type: 'text',
            placeholder: 'Щоб вийти на зворотній контакт',
            disabled: sent,
          }}
        />
      </div>
      <div className="flex flex-col">
        <Field
          label="Місцезнаходження"
          element="input"
          config={{
            ...register('location', { required: true }),
            type: 'text',
            placeholder: 'Одразу будемо орієнтуватись на відстань між нами',
            disabled: sent,
          }}
        />
      </div>
      <div className="flex flex-col">
        <Field
          label="Повідомлення"
          config={{
            ...register('message', { required: true }),
            placeholder:
              'Розкажіть детально чим можете допомагати, коли і як часто',
            disabled: sent,
          }}
          element="textarea"
        />
      </div>

      <div className="mt-3 flex">
        {sent ? (
          <Thankyou contact={getValues('contacts')} name={getValues('name')} />
        ) : (
          <Button className="ml-auto" disabled={loading || !formState.isValid}>
            Надіслати
          </Button>
        )}
      </div>
    </form>
  );
}

function Thankyou({ contact, name }: { contact: string; name: string }) {
  const isEmail = /[^@]+@[^@]{2,}/.test(contact);

  return (
    <div>
      Повідомлення надіслано і ми уже беремось його переглядати.{' '}
      {name[0].toUpperCase()}
      {name.slice(1).toLowerCase()}, намагатимемось дати швидку реакцію на{' '}
      {isEmail ? 'email' : 'номер'} <strong>{contact}</strong>.
    </div>
  );
}

type E = 'input' | 'textarea';

function Field<T extends E>({
  label,
  config,
  element,
}: {
  label: string;
  config: UseFormRegisterReturn & JSX.IntrinsicElements[T];
  element: T;
}) {
  const Element = element;

  return (
    <label className="flex p-[2px] rounded-lg bg-linear-to-r from-sky-50 to-zinc-50">
      <span className="py-2 px-3 w-45">{label}</span>
      <Element className="bg-stone-50 flex-auto p-2" {...config} />
    </label>
  );
}
