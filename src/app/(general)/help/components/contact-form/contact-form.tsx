'use client';

import { useForm } from 'react-hook-form';

export default function ContactForm() {
  const { register, handleSubmit } = useForm();

  const formSubmit = (data: unknown) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)} className="flex flex-col gap-4">
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
        <input id="job-position" type="text" {...register('job position')} />
      </div>
      <div className="flex flex-col">
        <label htmlFor="location">Місцезнаходження</label>
        <input id="location" type="text" {...register('location')} />
      </div>
      <div className="flex flex-col">
        <label htmlFor="message">Повідомлення</label>
        <textarea id="message" {...register('message')} />
      </div>
      <button type="submit">Надіслати</button>
    </form>
  );
}
