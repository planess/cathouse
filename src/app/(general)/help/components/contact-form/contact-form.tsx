'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ContactFormData } from '../../models/contact-form-data';

export default function ContactForm({
  handler,
}: {
  handler: (data: ContactFormData) => Promise<{ status: string }>;
}) {
  const { register, handleSubmit } = useForm<ContactFormData>();
  const [sent, setSent] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const c = handleSubmit(handler);

  const b = async (e: React.FormEvent) => {
    setDisabled(true);

    await c(e);

    setSent(true);
    setDisabled(false);
  };

  const a = (data: React.FormEvent) => {
    void b(data);
  };

  return (
    <form onSubmit={a} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label htmlFor="name">Ім&apos;я</label>
        <input id="name" type="text" {...register('name')} />
      </div>
      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
      </div>
      <div className="flex flex-col">
        <label htmlFor="phone">Телефон</label>
        <input id="phone" type="tel" {...register('phone')} />
      </div>
      <div className="flex flex-col">
        <label htmlFor="job-position">Посада</label>
        <input id="job-position" type="text" {...register('jobPosition')} />
      </div>
      <div className="flex flex-col">
        <label htmlFor="location">Місцезнаходження</label>
        <input id="location" type="text" {...register('location')} />
      </div>
      <div className="flex flex-col">
        <label htmlFor="message">Повідомлення</label>
        <textarea id="message" {...register('message')} />
      </div>
      {sent ? <p>Надіслано</p> : <button type="submit" disabled={disabled}>Надіслати</button>}
    </form>
  );
}
