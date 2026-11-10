import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function RegistryComingSoon() {
  const t = await getTranslations('historypage.comingSoon');

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12 sm:px-6">
      <section className="w-full max-w-3xl rounded-[30px] border border-[#d7e5df] dark:border-[#2d4a3e] bg-[#eef3ef] dark:bg-[#1a2e27] px-6 py-12 text-center shadow-[0_18px_60px_rgba(89,110,102,0.10)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.30)] sm:px-10 transition-colors">
        <p className="mb-6 inline-flex rounded-full bg-[#d3e8dc] dark:bg-[#1e3d30] px-4 py-1.5 text-sm font-semibold text-[#4b9b71] dark:text-[#6bbf92] transition-colors">
          {t('eyebrow')}
        </p>
        <h1 className="mb-4 text-2xl font-black tracking-tight text-[#112b27] dark:text-[#e0ede9] sm:text-4xl transition-colors">
          {t('title')}
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[#64807a] dark:text-[#8aa9a1] sm:text-lg transition-colors">
          {t('description')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-[#4a9c72] px-6 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(74,156,114,0.28)] transition-colors hover:bg-[#408966]"
        >
          {t('backHome')}
        </Link>
      </section>
    </div>
  );
}
