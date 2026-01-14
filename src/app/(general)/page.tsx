import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import Alert from '@app/components/alert/alert';
import Link from 'next/link';
import { ReportDialogTrigger } from '@app/components/report-dialog';
import {
  CaptureIcon,
  CheckRoundIcon,
  CommunityLove,
  HomeCareIcon,
  MedicalAssistance,
  MedicalBoxIcon,
  PetsIcon,
  SearchIcon,
  TrendingDown,
  VaccinesIcon,
  VisibilityIcon,
} from './history/[animalId]/components/icons';

const missionKeys = ['population', 'medical', 'community'] as const;
const trackerActionKeys = ['reports', 'stations', 'emergency'] as const;

const icons = [
  <RoundIcon
    icon={<VisibilityIcon />}
    className="bg-[#00a6f4]/10 text-[#00a6f4]"
  />,
  <RoundIcon
    icon={<SearchIcon />}
    className="bg-[#00a6f4]/10 text-[#00a6f4]"
  />,
  <RoundIcon
    icon={<CaptureIcon />}
    className="bg-[#00a6f4]/10 text-[#00a6f4]"
  />,
  <RoundIcon
    icon={<MedicalBoxIcon />}
    className="bg-[#00a6f4]/10 text-[#00a6f4]"
  />,
  <RoundIcon
    icon={<VaccinesIcon />}
    className="bg-[#00a6f4]/10 text-[#00a6f4]"
  />,
  <RoundIcon
    icon={<HomeCareIcon />}
    className="bg-[#00a6f4]/10 text-[#00a6f4]"
  />,
  <RoundIcon icon={<PetsIcon />} className="bg-[#00a6f4]/10 text-[#00a6f4]" />,
];

export default function Home() {
  const t = useTranslations('homepage');

  const missionFeatures = missionKeys.map((key) => ({
    key,
    title: t(`mission.features.${key}.title`),
    description: t(`mission.features.${key}.description`),
  }));

  const tnrSteps = Array.from({ length: 7 }, (_, index) => {
    const step = `${index + 1}`;

    return {
      index: index + 1,
      icon: icons[index],
      title: t(`tnr.steps.${step}.title`),
      description: t(`tnr.steps.${step}.description`),
    };
  });

  const trackerActions = trackerActionKeys.map((key) =>
    t(`tracker.actions.${key}`),
  );

  return (
    <main className="bg-[#f6f8f6] text-slate-900">
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="space-y-8">
            <Alert
              text={t.rich('hero.announcement.note', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            />

            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-[-0.033em]">
                {t.rich('hero.title.lead', {
                  highlight: (chunks) => (
                    <Link
                      href="/history"
                      className="text-[#00a6f4] underline decoration-4 underline-offset-4 decoration-sky-300/30"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </h1>
              <p className="text-slate-600 text-base md:text-lg font-normal leading-relaxed dark:text-gray-300 mx-auto ">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <ReportDialogTrigger text={t('hero.ctaReport')} />

              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition cursor-pointer  bg-white dark:bg-[#1a331a] border border-[#e7f3e7] dark:border-[#2a442a] hover:bg-[#f0fdf0] dark:hover:bg-[#203a20] transition-colors text-[#0d1b0d] dark:text-white tracking-[0.015em]"
              >
                {t('hero.ctaHelp')}
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="absolute -z-10 top-10 right-10 w-[80%] h-[80%] bg-gradient-to-tr from-primary/30 to-blue-200 rounded-full blur-3xl opacity-40"></div>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl relative">
              <div
                className="w-full h-full bg-cover bg-center"
                data-alt="Close up of a cute cat face outdoors looking up"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKnnXIPPVqgZnDRm5pdUsAtRDGC4qLtuC01Tq-bWifMzkXsXIITUUSfqPbjFk4IDXFuMCzkyCfNhgDCZE5ahLDrAALPnFzS9gjgDf7ftx8OQiuAVY0iwwgDOwQgUODUGOerUU0h3q9Azxc-85MZW6pRF31CcN3YRetsSiuPUctavOAZNO_39IWo3QGmUcKEpCysHI596tpfuzLr6Neh20o8iHvm5DMm2D4W4nY8NSvVD-lTQlvq14eUQOH5DYHouMo6y8WHjelgOc')",
                }}
              ></div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-[#1a331a]/90 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-lg flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg text-blue-600 dark:text-blue-300">
                  <span>
                    <svg
                      aria-hidden="true"
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{t('hero.badge.label')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('hero.badge.value')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="bg-white dark:bg-[#0d1b0d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="mx-auto space-y-10 max-w-[960px]">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t('mission.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('mission.description')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {missionFeatures.map((feature) => (
              <div
                key={feature.key}
                className="rounded-2xl bg-[#f6f8f6] border border-slate-100 p-6 hover:shadow-lg transition-shadow flex flex-col items-center text-center"
              >
                {feature.key === 'population' && (
                  <RoundIcon
                    icon={<TrendingDown />}
                    className="bg-[#00a6f4]/20 text-[#0a2e0a]"
                  />
                )}
                {feature.key === 'medical' && (
                  <RoundIcon
                    icon={<MedicalAssistance />}
                    className="bg-sky-100 text-sky-700"
                  />
                )}
                {feature.key === 'community' && (
                  <RoundIcon
                    icon={<CommunityLove />}
                    className="bg-orange-100 text-orange-700"
                  />
                )}

                <h3 className="text-lg font-bold text-slate-900 mt-4">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="mx-auto max-w-6xl space-y-10">
          <div className="text-center space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#00a6f4]">
              {t('tnr.label')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              {t('tnr.title')}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tnrSteps.map((step) => (
              <div
                key={step.index}
                className={clsx(
                  'flex flex-col gap-3 group rounded-xl border border-gray-100 bg-white p-6 hover:border-[#00a6f4]/50 transition-colors',
                  {
                    'lg:col-span-2': step.index >= tnrSteps.length,
                    'md:col-span-2': step.index >= tnrSteps.length,
                  },
                )}
              >
                <div className="flex items-center gap-4">
                  {step.icon}

                  <div className="text-lg font-bold">
                    {step.index}.&nbsp;{step.title}
                  </div>
                </div>

                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="bg-white dark:bg-[#0d1b0d] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-500">
                {t('tracker.subtitle')}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
                {t('tracker.title')}
              </h2>
            </div>
            <p className="text-lg text-slate-600">{t('tracker.description')}</p>
            <ul className="space-y-3 text-sm text-slate-700">
              {trackerActions.map((action) => (
                <li key={action} className="flex items-start gap-3">
                  <span className="inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold text-emerald-600">
                    <CheckRoundIcon />
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
            <Link
              className="inline-flex items-center cursor-pointer rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/40 transition-colors hover:bg-emerald-400 tracking-[0.015em]"
              href="/history"
            >
              {t('tracker.cta')}
            </Link>
          </div>

          <div className="flex justify-center items-center">
            <div className="relative">
              <img
                src="https://pub-b01557542cb14ab3a2c20e32a7373072.r2.dev/c949f56386fb3bf3ca901814052b5481.jpg"
                alt="Cat Tracker Illustration"
              />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 px-4 py-2 text-xs p-4 shadow-lg flex items-center gap-3 border border-white/30">
                <div className="flex-1 text-slate-700 flex flex-col gap-1">
                  <span className="font-semibold">
                    {t('tracker.card.status')}
                  </span>
                  <span className="font-bold">{t('tracker.card.value')}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {t('tracker.card.timestamp')}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

interface RoundIconProps {
  className: string;
  icon: React.ReactNode;
}

function RoundIcon({ className, icon }: RoundIconProps) {
  return (
    <div
      className={clsx(
        'flex size-12 items-center justify-center rounded-full flex-none',
        className,
      )}
    >
      <span className="size-6">{icon}</span>
    </div>
  );
}
