import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import OfferNavigation from '@app/components/offer-navigation/offer-navigation';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import {
  AnalyticsIcon,
  CatchIcon,
  CreditCardSecureIcon,
  DisasterIcon,
  GavelIcon,
  GuaranteeIcon,
  InfoIcon,
  MealIcon,
  MedicalKitIcon,
  PaymentBitcoinIcon,
  PetsIcon,
  ReceiptIcon,
  RefundIcon,
  VolunteerHeartIcon,
  WalletMinusIcon,
} from '../registry/[animalId]/components/icons';

import { Accordion } from './accordion';
import Section from './section';

import type { Metadata } from 'next';

export default function OfferPage() {
  const t = useTranslations('offerpage');

  const navigationItems = [
    { id: 'section1', label: t('nav.items.section1'), icon: <InfoIcon /> },
    {
      id: 'section2',
      label: t('nav.items.section2'),
      icon: <VolunteerHeartIcon />,
    },
    {
      id: 'section3',
      label: t('nav.items.section3'),
      icon: <WalletMinusIcon />,
    },
    {
      id: 'section4',
      label: t('nav.items.section4'),
      icon: <PaymentBitcoinIcon />,
    },
    {
      id: 'section5',
      label: t('nav.items.section5'),
      icon: <RefundIcon />,
    },
    { id: 'section6', label: t('nav.items.section6'), icon: <GuaranteeIcon /> },
    {
      id: 'section7',
      label: t('nav.items.section7'),
      icon: <AnalyticsIcon />,
    },
    {
      id: 'section8',
      label: t('nav.items.section8'),
      icon: <CreditCardSecureIcon />,
    },
    { id: 'section9', label: t('nav.items.section9'), icon: <DisasterIcon /> },
    { id: 'section10', label: t('nav.items.section10'), icon: <GavelIcon /> },
    {
      id: 'requisites',
      label: t('nav.items.requisites'),
      icon: <ReceiptIcon />,
    },
  ];

  const questions = [
    {
      question: t('faq.items.report.question'),
      answer: t('faq.items.report.answer'),
    },
    {
      question: t('faq.items.excess.question'),
      answer: t('faq.items.excess.answer'),
    },
    {
      question: t('faq.items.facilities_support.question'),
      answer: t('faq.items.facilities_support.answer'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-12 py-8 transition-[padding]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="space-y-3">
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-bold tracking-tight transition-colors">
            {t('title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-200 text-base transition-colors">
            {t('intro')}
          </p>
        </div>
        {/* <button className="flex items-center gap-2 min-w-[160px] cursor-pointer justify-center rounded-xl h-12 px-5 bg-white dark:bg-[#1c2636] border border-[#e7ebf4] dark:border-[#2d3a52] text-[#0d121c] dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#253247] transition-all">
          <span className="material-symbols-outlined text-xl">download</span>
          <span>Завантажити PDF</span>
        </button> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="hidden lg:block lg:w-1/3 ">
          <div className="sticky top-18">
            <OfferNavigation
              title={t('nav.title')}
              subtitle={t('nav.subtitle')}
              items={navigationItems}
            />
          </div>
        </aside>

        <article className="lg:w-2/3 space-y-7 pb-20">
          <section className="scroll-mt-28" id="section1">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              1. {t('sections.general.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <p>
                <strong>1.1.</strong> {t('sections.general.p1')}
              </p>
              <p>
                <strong>1.2.</strong> {t('sections.general.p2')}
              </p>
              <p>
                <strong>1.3.</strong> {t('sections.general.p3')}
              </p>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <strong>1.4.</strong>{' '}
                  {t('sections.general.definitions.title')}
                </h3>
                <p>
                  <strong>1.4.1.</strong> {t('sections.general.definitions.p1')}
                </p>
                <p>
                  <strong>1.4.2.</strong> {t('sections.general.definitions.p2')}
                </p>
                <p>
                  <strong>1.4.3.</strong> {t('sections.general.definitions.p3')}
                </p>
                <p>
                  <strong>1.4.4.</strong> {t('sections.general.definitions.p4')}
                </p>
                <p>
                  <strong>1.4.5.</strong> {t('sections.general.definitions.p5')}
                </p>
              </div>
            </div>
          </section>

          <section className="scroll-mt-28" id="section2">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100 transition-colors">
              2. {t('sections.donation.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1 transition-colors">
              <p className="text-slate-700 dark:text-slate-100 transition-colors">
                <strong>2.1.</strong> {t('sections.donation.p1')}
              </p>
              <p>
                <strong>2.2.</strong> {t('sections.donation.p2')}
              </p>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <strong>2.3.</strong> {t('sections.donation.rightsTitle')}
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t('sections.donation.rights.p1')}</li>
                  <li className="text-slate-700 dark:text-slate-100">
                    {t('sections.donation.rights.p2')}
                  </li>
                  <li className="text-slate-700 dark:text-slate-100">
                    {t('sections.donation.rights.p3')}
                  </li>
                </ul>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <strong>2.4.</strong>{' '}
                  {t('sections.donation.obligationsTitle')}
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t('sections.donation.obligations.p1')}</li>
                  <li className="text-slate-700 dark:text-slate-100">
                    {t('sections.donation.obligations.p2')}
                  </li>
                </ul>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <strong>2.5.</strong>{' '}
                  {t('sections.donation.foundationRightsTitle')}
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-slate-700 dark:text-slate-100">
                    {t('sections.donation.foundationRights.p1')}
                  </li>
                  <li>{t('sections.donation.foundationRights.p2')}</li>
                  <li>{t('sections.donation.foundationRights.p3')}</li>
                </ul>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <strong>2.6.</strong>{' '}
                  {t('sections.donation.foundationObligationsTitle')}
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li className="text-slate-700 dark:text-slate-100">
                    {t('sections.donation.foundationObligations.p1')}
                  </li>
                  <li className="text-slate-700 dark:text-slate-100">
                    {t('sections.donation.foundationObligations.p2')}
                  </li>
                  <li>{t('sections.donation.foundationObligations.p3')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="scroll-mt-28" id="section3">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              3. {t('sections.use.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  3.1. {t('sections.use.general.title')}
                </h3>
                <p className="text-slate-700 dark:text-slate-100">
                  {t('sections.use.general.description')}
                </p>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  3.2. {t('sections.use.targeted.title')}
                </h3>
                <p className="text-slate-700 dark:text-slate-100">
                  {t('sections.use.targeted.description')}
                </p>
                <ul className="space-y-2 list-none text-slate-700 dark:text-slate-100">
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <CatchIcon />
                    </span>
                    <span>
                      <strong>
                        {t('sections.use.targeted.items.catch.title')}
                      </strong>{' '}
                      {t('sections.use.targeted.items.catch.description')}
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <PetsIcon />
                    </span>
                    <span>
                      <strong>
                        {t('sections.use.targeted.items.sterilization.title')}
                      </strong>{' '}
                      {t(
                        'sections.use.targeted.items.sterilization.description',
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <MedicalKitIcon />
                    </span>
                    <span>
                      <strong>
                        {t('sections.use.targeted.items.treatment.title')}
                      </strong>{' '}
                      {t('sections.use.targeted.items.treatment.description')}
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <MealIcon />
                    </span>
                    <span>
                      <strong>
                        {t('sections.use.targeted.items.food.title')}
                      </strong>{' '}
                      {t('sections.use.targeted.items.food.description')}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  3.3. {t('sections.use.distribution.title')}
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-100">
                  <li>{t('sections.use.distribution.p1')}</li>
                  <li>{t('sections.use.distribution.p2')}</li>
                  <li>{t('sections.use.distribution.p3')}</li>
                </ul>
              </div>
              {/* <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  3.4. {t('sections.use.recurring.title')}
                </h3>
                <p>
                  <strong>3.4.1.</strong> {t('sections.use.recurring.p1')}
                </p>
                <p>
                  <strong>3.4.2.</strong> {t('sections.use.recurring.p2')}
                </p>
                <p>
                  <strong>3.4.3.</strong> {t('sections.use.recurring.p3')}
                </p>
              </div> */}
            </div>
          </section>

          <section className="scroll-mt-28" id="section4">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              4. {t('sections.leftovers.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <p className="text-slate-700 dark:text-slate-100">
                <strong>4.1.</strong> {t('sections.leftovers.p1')}
              </p>
              <p className="text-slate-700 dark:text-slate-100">
                <strong>4.2.</strong> {t('sections.leftovers.p2')}
              </p>
              <p className="text-slate-700 dark:text-slate-100">
                <strong>4.3.</strong> {t('sections.leftovers.p3')}
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section5">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              5. {t('sections.nonRefundable.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <div className="bg-[#256af4]/5 border-l-4 border-[#256af4] p-5 rounded-r-lg my-2">
                <p className="font-medium">
                  <strong>5.1.</strong> {t('sections.nonRefundable.p1')}
                </p>
              </div>
              <p>
                <strong>5.2.</strong> {t('sections.nonRefundable.p2')}
              </p>
              <p>
                <strong>5.3.</strong> {t('sections.nonRefundable.p3')}
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section6">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              6. {t('sections.liability.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <p className="text-slate-700 dark:text-slate-100">
                <strong>6.2.</strong> {t('sections.liability.p2')}
              </p>
              <p>
                <strong>6.3.</strong> {t('sections.liability.p3')}
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section7">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              7. {t('sections.transparency.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <p>
                <strong>7.1.</strong> {t('sections.transparency.p1')}
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section8">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              8. {t('sections.confidentiality.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <p className="text-slate-700 dark:text-slate-100">
                <strong>8.1.</strong> {t('sections.confidentiality.p1')}
              </p>
              <p>
                <strong>8.2.</strong> {t('sections.confidentiality.p2')}
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section9">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              9. {t('sections.forceMajeure.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <p>
                <strong>9.1.</strong> {t('sections.forceMajeure.p1')}
              </p>
              <p>
                <strong>9.2.</strong> {t('sections.forceMajeure.p2')}
              </p>
              <p>
                <strong>9.3.</strong> {t('sections.forceMajeure.p3')}
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section10">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              10. {t('sections.final.title')}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-300 leading-relaxed space-y-1">
              <p>
                <strong>10.1.</strong> {t('sections.final.p1')}
              </p>
              <p>
                <strong>10.2.</strong> {t('sections.final.p2')}
              </p>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <strong>10.3.</strong> {t('sections.final.term.title')}
                </h3>
                <p>
                  <strong>10.3.1.</strong> {t('sections.final.term.p1')}
                </p>
                <p>
                  <strong>10.3.2.</strong> {t('sections.final.term.p2')}
                </p>
                <p>
                  <strong>10.3.3.</strong> {t('sections.final.term.p3')}
                </p>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  <strong>10.4.</strong> {t('sections.final.other.title')}
                </h3>
                <p>
                  <strong>10.4.1.</strong> {t('sections.final.other.p1')}
                </p>
                <p>
                  <strong>10.4.2.</strong> {t('sections.final.other.p2')}
                </p>
              </div>
            </div>
          </section>

          <Section title={t('requisites.title')} id="requisites">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-[#49659c] dark:text-[#a1b2d3]">
              <div className="space-y-2">
                <p className="font-bold text-[#0d121c] dark:text-white">
                  {t('requisites.labels.fullName')}
                </p>
                <p>{t('requisites.values.fullName')}</p>
                <p className="font-bold text-[#0d121c] dark:text-white mt-4">
                  {t('requisites.labels.edrpou')}
                </p>
                <p>45962629</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-[#0d121c] dark:text-white">
                  {t('requisites.labels.address')}
                </p>
                <p>{t('requisites.values.address')}</p>
                <p className="font-bold text-[#0d121c] dark:text-white mt-4">
                  {t('requisites.labels.email')}
                </p>
                <p>
                  <a href="mailto:info@perilines.com.ua">
                    info@perilines.com.ua
                  </a>
                </p>
              </div>
            </div>
          </Section>

          <Accordion items={questions} title={t('faq.title')} />
        </article>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('offerpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
