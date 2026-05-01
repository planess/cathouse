import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { listRegistryLightAnimalsPage } from '../server/list-registry-light-animals';

import RegistryLightAnimals from './registry-light-animals';

function HandHeartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M6.583 10.25 4.44 8.107a2.173 2.173 0 0 1 3.072-3.072l.5.5.5-.5a2.173 2.173 0 1 1 3.072 3.072L9.44 10.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 11.167h2.333l1.5-1.667 1.834 4L10.833 10l1 1.167H16.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WrenchLeafIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M11.916 3.75a4.002 4.002 0 0 0 1.758 5.246L7.25 15.42a1.414 1.414 0 1 1-2-2l6.424-6.424A4.002 4.002 0 0 0 16.92 5.24l-2.337 2.336-2.166-.5-.5-2.166 2.337-2.336a4 4 0 0 0-2.338 1.176Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function RegistryLightContent() {
  const initialPage = await listRegistryLightAnimalsPage();
  const t = await getTranslations('registryLightPage');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_28%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[30px] border border-[#d7e5df] bg-[#eef3ef] px-6 py-12 shadow-[0_18px_60px_rgba(89,110,102,0.10)] sm:px-10 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute -right-8.5 -top-7.5 h-36 w-36 rounded-[36px] border-12 border-[#dbe8e2] opacity-80 transform-[rotate(45deg)]" />
          <div className="pointer-events-none absolute right-4.5 top-4.5 h-28 w-28 rounded-[28px] border-8 border-[#e5efea] opacity-90 transform-[rotate(45deg)]" />

          <p className="inline-flex absolute top-1 left-2 lg:top-2.5 lg:left-4 rounded-full bg-[#d3e8dc] px-4 py-1.5 text-sm font-semibold text-[#4b9b71] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {t('eyebrow')}
          </p>

          <div className="relative max-w-9/10 space-y-7">
            <div className="space-y-6">
              <h1 className="text-xl font-black leading-[0.95] tracking-[-0.06em] text-[#112b27] sm:text-2xl lg:text-5xl">
                {t.rich('headline', {
                  accent: (chunks) => (
                    <span className="text-[#4c9f74]">{chunks}</span>
                  ),
                })}
              </h1>
              <p className="max-w-3xl text-[1.05rem] leading-[1.55] text-[#64807a] sm:text-[1.15rem]">
                {t('description')}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/contacts#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4a9c72] px-6 py-3.5 text-base font-semibold text-white shadow-[0_8px_20px_rgba(74,156,114,0.28)] transition-colors hover:bg-[#408966]"
              >
                <HandHeartIcon />
                {t('cta.sponsor')}
              </Link>
              <Link
                href="/help#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c7d5cf] bg-[#eef3ef] px-6 py-3.5 text-base font-medium text-[#243935] shadow-[0_4px_14px_rgba(36,57,53,0.08)] transition-colors hover:border-[#9fb5ad] hover:bg-white"
              >
                <WrenchLeafIcon />
                {t('cta.supplies')}
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {initialPage.total === 0 ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/80 px-6 py-14 text-center text-stone-600 shadow-[0_18px_60px_rgba(41,37,36,0.06)]">
              {t('empty')}
            </div>
          ) : (
            <RegistryLightAnimals initialPage={initialPage} />
          )}
        </section>
      </div>
    </div>
  );
}
