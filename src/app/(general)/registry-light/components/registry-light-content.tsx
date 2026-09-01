import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import type { RegistryStatusFilter } from '@app/(general)/registry/helpers/registry-status-filter';
import { HandHeartIcon } from '@app/components/icons/registry-light-h-an-dh-ea-rt-ic-on';
import { WrenchLeafIcon } from '@app/components/icons/registry-light-w-re-nc-hl-ea-fi-co-n';

import { listRegistryLightAnimalsPage } from '../server/list-registry-light-animals';

import RegistryLightAnimals from './registry-light-animals';

export default async function RegistryLightContent({
  statusFilter = null,
}: {
  statusFilter?: RegistryStatusFilter | null;
}) {
  const initialPage = await listRegistryLightAnimalsPage({ statusFilter });
  const t = await getTranslations('registryLightPage');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_28%),linear-gradient(180deg,#fffaf0_0%,#f8fafc_48%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(74,156,114,0.10),transparent_28%),linear-gradient(180deg,#0f1a17_0%,#111827_48%,#111827_100%)] transition-colors px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[30px] border border-[#d7e5df] dark:border-[#2d4a3e] bg-[#eef3ef] dark:bg-[#1a2e27] px-6 py-12 shadow-[0_18px_60px_rgba(89,110,102,0.10)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.30)] sm:px-10 lg:px-12 lg:py-14 transition-colors">
          <div className="pointer-events-none absolute -right-8.5 -top-7.5 h-36 w-36 rounded-[36px] border-12 border-[#dbe8e2] dark:border-[#2a3e36] opacity-80 transform-[rotate(45deg)]" />
          <div className="pointer-events-none absolute right-4.5 top-4.5 h-28 w-28 rounded-[28px] border-8 border-[#e5efea] dark:border-[#304038] opacity-90 transform-[rotate(45deg)]" />

          <p className="inline-flex absolute top-1 left-2 lg:top-2.5 lg:left-4 rounded-full bg-[#d3e8dc] dark:bg-[#1e3d30] px-4 py-1.5 text-sm font-semibold text-[#4b9b71] dark:text-[#6bbf92] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-colors">
            {t('eyebrow')}
          </p>

          <div className="relative max-w-9/10 space-y-7">
            <div className="space-y-6">
              <h1 className="text-xl font-black leading-[0.95] tracking-[-0.06em] text-[#112b27] dark:text-[#e0ede9] sm:text-2xl lg:text-5xl transition-colors">
                {t.rich('headline', {
                  accent: (chunks) => (
                    <span className="text-[#4c9f74] dark:text-[#6bbf92]">{chunks}</span>
                  ),
                })}
              </h1>
              <p className="max-w-3xl text-[1.05rem] leading-[1.55] text-[#64807a] dark:text-[#8aa9a1] sm:text-[1.15rem] transition-colors">
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c7d5cf] dark:border-[#3a5448] bg-[#eef3ef] dark:bg-[#1a2e27] px-6 py-3.5 text-base font-medium text-[#243935] dark:text-[#c8ddd8] shadow-[0_4px_14px_rgba(36,57,53,0.08)] transition-colors hover:border-[#9fb5ad] hover:bg-white dark:hover:bg-[#243935]"
              >
                <WrenchLeafIcon />
                {t('cta.supplies')}
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {initialPage.total === 0 ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 dark:border-stone-600 bg-white/80 dark:bg-neutral-800/80 px-6 py-14 text-center text-stone-600 dark:text-stone-400 shadow-[0_18px_60px_rgba(41,37,36,0.06)] transition-colors">
              {t('empty')}
            </div>
          ) : (
            <RegistryLightAnimals
              initialPage={initialPage}
              statusFilter={statusFilter}
            />
          )}
        </section>
      </div>
    </div>
  );
}
