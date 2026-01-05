import { useTranslations } from 'next-intl';

export default function Location() {
  const t = useTranslations('locationpage');

  return (
    <div className="px-6 py-7">
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg text-zinc-700">{t('body')}</p>
    </div>
  );
}
