import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('header');

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1>Welcome to Cathouse - App is working!</h1>
      <p>This is a test page to verify the app is running correctly.</p>
      <div>
        <h2>Internationalization Test general:</h2>
        <p>Home: {t('home')}</p>
        <p>Contacts: {t('contacts')}</p>
        <p>History: {t('history')}</p>
        <p>Help: {t('help')}</p>
      </div>
    </div>
  );
}
