import { useTranslations } from 'next-intl';

export default function Home() {
  const navigation = useTranslations('header');
  const t = useTranslations('homepage');

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <div>
        <h2>{t('checklist.title')}</h2>
        <p>{t('checklist.helper')}</p>
        <p>Home: {navigation('home')}</p>
        <p>Contacts: {navigation('contacts')}</p>
        <p>History: {navigation('history')}</p>
        <p>Help: {navigation('help')}</p>
      </div>
    </div>
  );
}
