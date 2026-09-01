import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';


import { BankIcon } from '@app/components/icons/registry-animal-b-an-ki-co-n';
import { DogBowlIcon } from '@app/components/icons/registry-animal-d-og-bo-wl-ic-on';
import { HealthInterventionIcon } from '@app/components/icons/registry-animal-h-ea-lt-hi-nt-er-ve-nt-io-ni-co-n';
import { MedicalKitIcon } from '@app/components/icons/registry-animal-m-ed-ic-al-ki-ti-co-n';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { AutoPayment } from './components/auto-payment';
import IbanCards, { IbanCardItem } from './components/iban-cards';

import type { Metadata } from 'next';

const useTiles = [
  {
    key: 'sterilization',
    icon: <HealthInterventionIcon />,
  },
  {
    key: 'treatment',
    icon: <MedicalKitIcon />,
  },
  {
    key: 'food',
    icon: <DogBowlIcon />,
  },
] as const;
const ibanKeys = [
  {
    currency: 'UAH',
    edrpou: '45962629',
    mfo: '322001',
    iban: 'UA88 322001 00000 2600 2700 0084 46',
    bank: 'АТ "УНІВЕРСАЛ БАНК"',
    recipient: 'БО "БФ "Периферія"',
  },
  {
    currency: 'UAH',
    edrpou: '45962629',
    mfo: '307770',
    iban: 'UA63 307770 00000 2600 4111 2409 53',
    bank: 'АТ "А - Банк"',
    recipient: 'БО "БФ "Периферія"',
  },
] as IbanCardItem[];
const ibanQuestions = [
  { answer: 'answer1' },
  { question: 'question2', answer: 'answer2' },
];
const nonMoneyCards = ['foster', 'walking', 'experts', 'items'] as const;

export default function PaymentsPage() {
  const t = useTranslations('paymentspage');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6 lg:px-12">
      <section>
        <div
          className="flex min-h-70 flex-col items-center justify-center gap-6 rounded-2xl border border-slate-100 bg-cover bg-center bg-no-repeat p-8 text-center shadow-sm"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBBst-cfmkdfB1AbjpOI7iAfrDbPMLFudYsUyDUZjiZYHSV30tv5BHJfgJpF6NKKLj1xAmA-XZ6YeP2i91RpGAAM4AQ0rqfArFN1wKR8D1OtXEA9gABDOxquz-wSuKXGog6byBDb6zQJ3-tB8VJUWw_4cdB4VuOH3mex0pYeVaJUUvqArum7C3IqmQwBY20C1GgEzDtImtwNEzUC8di5t9kjHzMKmTnZNj3ij2MjgirbW2ca3GHVcoASKVqHZJTv_zGfXaChq1vGpo")',
          }}
        >
          <div className="flex max-w-[70%] flex-col gap-3">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 lg:text-4xl">
              {t('title')}
            </h1>
            <p className="mx-auto text-base font-medium leading-normal text-slate-700 bg-sky-50/20 dark:bg-neutral-400/40 dark:text-slate-800 px-3 py-6 rounded-lg border border-slate-100 text-shadow-white">
              {t('intro')}
            </p>
          </div>
          <div className="max-w-xl rounded-lg border border-slate-100 bg-white/10 dark:bg-neutral-400/30 dark:text-slate-700 p-4 text-left text-[11px] italic leading-relaxed text-slate-600 backdrop-blur-sm">
            {t('heroNote')}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-0.5 text-center">
          <h2 className="text-2xl font-extrabold leading-tight">
            {t('financial.title')}
          </h2>
          <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
            {t('financial.subtitle')}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {useTiles.map((tile) => (
            <li
              key={tile.key}
              className="group relative flex flex-col items-center gap-4 text-center md:after:absolute md:after:top-12 md:after:left-[80%] md:after:w-[40%] md:after:border-b-2 md:after:border-dashed md:after:transform-[translateX(20px)] md:after:border-sky-400/60 md:after:content-[''] md:last:after:hidden"
            >
              <div className="flex p-5 items-center justify-center rounded-full bg-cyan-500 text-slate-100 shadow-sm transition-all group-hover:-translate-y-0.5">
                <span className="size-10 flex items-center justify-center">
                  {tile.icon}
                </span>
              </div>
              <div className="flex max-w-[80%] flex-col gap-2">
                <h3 className="text-lg font-bold">
                  {t(`financial.uses.${tile.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                  {t(`financial.uses.${tile.key}.description`)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div
          id="donate"
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4 dark:bg-zinc-700 dark:border-zinc-500 transition-colors"
        >
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-extrabold ">
                <span className="inline-flex size-6 items-center justify-center rounded-full text-blue-600 dark:text-zinc-200 transition-colors">
                  <BankIcon />
                </span>
                {t('financial.ibanTitle')}
              </h3>

              {t.rich('financial.offerLink', {
                link: (chunks) => (
                  <Link
                    href="/offer"
                    className="text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </div>

            <IbanCards ibanKeys={ibanKeys} />
          </div>

          <div className="text-sky-700 text-sm space-y-2 dark:text-zinc-300 transition-colors">
            {ibanQuestions.map(({ question, answer }) => (
              <div key={answer}>
                {question && (
                  <div className="font-bold">
                    {t(`financial.ibanQuestions.${question}`)}
                  </div>
                )}
                <div>{t(`financial.ibanQuestions.${answer}`)}</div>
              </div>
            ))}
          </div>

          <div>
            <AutoPayment bank={ibanKeys[0]} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-0.5 text-center">
          <h2 className="text-2xl font-extrabold leading-tight">
            {t('nonMoney.title')}
          </h2>
          <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
            {t('nonMoney.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {/* Перетримка, 
            польова робота (вилов тварин, перевезення)
            (допомога юристів, бухгалтерів, smm тощо)
            лікарі з ліцензією */}
          {nonMoneyCards.map((key) => (
            <div
              key={key}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-zinc-600 dark:border-slate-500 shadow-sm transition-all duration-500 hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${t(`nonMoney.cards.${key}.image`)})`,
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6">
                <h4 className="text-lg font-extrabold">
                  {t(`nonMoney.cards.${key}.title`)}
                </h4>
                <p className="flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-300 transition-colors">
                  {t(`nonMoney.cards.${key}.description`)}
                </p>
                <Link
                  className="mt-4 w-full rounded-lg text-center border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-bold text-blue-600 transition-colors group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white dark:bg-sky-500 dark:text-slate-200 dark:group-hover:bg-sky-500/90 dark:border-sky-400 dark:group-hover:border-sky-400/80"
                  href="/help#contact-form"
                >
                  {t(`nonMoney.cards.${key}.cta`)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-zinc-600 dark:border-slate-500 transition-colors p-8 text-center shadow-sm md:flex-row md:text-left">
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-extrabold">{t('transparency.title')}</h3>
          <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">
            {t('transparency.description')}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-zinc-600 hover:bg-slate-50 dark:text-slate-600 dark:bg-gray-300 dark:border-gray-300 dark:hover:border-gray-400/80 dark:hover:bg-gray-300/90"
            href="/reports"
          >
            {t('transparency.reports')}
          </Link>
          <Link
            className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-500/90"
            href="/contacts"
          >
            {t('transparency.contact')}
          </Link>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('paymentspage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
