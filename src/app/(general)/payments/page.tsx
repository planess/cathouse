import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import {
  BankIcon,
  DogBowlIcon,
  FeedIcon,
  HealthInterventionIcon,
  MedicalKitIcon,
} from '../history/[animalId]/components/icons';
import IbanCards from './components/iban-cards';

import type { Metadata } from 'next';
import Link from 'next/link';

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
    edrpou: '00000000',
    mfo: '300000',
    iban: 'UA12 0000 0000 0000 00000 0000 0000',
    recipient: 'БО Периферія, Monobank',
  },
  {
    currency: 'UAH',
    edrpou: '00000000',
    mfo: '300000',
    iban: 'UA98 0000 0000 0000 00000 0000 0000',
    recipient: 'БФ "БО Периферія", А-Банк',
  },
];
const ibanQuestions = [
  {answer: 'answer1'},
  {question: 'question2', answer: 'answer2'},
];
const nonMoneyCards = ['foster', 'walking', 'experts', 'items'] as const;

export default function PaymentsPage() {
  const t = useTranslations('paymentspage');

  return (
    <div className="bg-slate-50 text-slate-900 transition-colors">
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
              <p className="mx-auto text-base font-medium leading-normal text-slate-700 bg-sky-50/20 px-3 py-6 rounded-lg border border-slate-100 text-shadow-white">
                {t('intro')}
              </p>
            </div>
            <div className="max-w-xl rounded-lg border border-slate-100 bg-white/10 p-4 text-left text-[11px] italic leading-relaxed text-slate-600 backdrop-blur-sm">
              {t('heroNote')}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-0.5 text-center">
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
              {t('financial.title')}
            </h2>
            <p className="text-base font-medium text-slate-500">
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
                  <h3 className="text-lg font-bold text-slate-900">
                    {t(`financial.uses.${tile.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {t(`financial.uses.${tile.key}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                  <span className="inline-flex size-6 items-center justify-center rounded-full text-blue-600">
                    <BankIcon />
                  </span>
                  {t('financial.ibanTitle')}
                </h3>
              </div>

              <IbanCards ibanKeys={ibanKeys} />
            </div>

            <div className="text-sky-700 text-sm space-y-2">
              {ibanQuestions.map(({question, answer}) => (
                <div key={question}>
                  {question && <div className="font-bold">{t(`financial.ibanQuestions.${question}`)}</div>}
                  <div>{t(`financial.ibanQuestions.${answer}`)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5 text-center">
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
              {t('nonMoney.title')}
            </h2>
            <p className="text-base font-medium text-slate-500">
              {t('nonMoney.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Перетримка, 
            польова робота (вилов тварин, перевезення)
            (допомога юристів, бухгалтерів, smm тощо)
            лікарі з ліцензією */}
            {nonMoneyCards.map((key) => (
              <div
                key={key}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${t(`nonMoney.cards.${key}.image`)})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h4 className="text-lg font-extrabold text-slate-900">
                    {t(`nonMoney.cards.${key}.title`)}
                  </h4>
                  <p className="flex-1 text-xs leading-relaxed text-slate-500">
                    {t(`nonMoney.cards.${key}.description`)}
                  </p>
                  <Link
                    className="mt-4 w-full rounded-lg text-center border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-bold text-blue-600 transition-all group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                    href="/help#contact-form"
                  >
                    {t(`nonMoney.cards.${key}.cta`)}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm md:flex-row md:text-left">
          <div className="flex max-w-xl flex-col gap-1">
            <h3 className="text-xl font-extrabold text-slate-900">
              {t('transparency.title')}
            </h3>
            <p className="text-base font-medium leading-relaxed text-slate-600">
              {t('transparency.description')}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <Link
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-600 hover:bg-slate-50"
              href="/reports"
            >
              {t('transparency.reports')}
            </Link>
            <Link
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700"
              href="/contacts"
            >
              {t('transparency.contact')}
            </Link>
          </div>
        </section>
      </div>
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
