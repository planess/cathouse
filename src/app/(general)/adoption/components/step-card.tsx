import Image from 'next/image';
import Link from 'next/link';

import { ExternalLinkIcon } from '@app/components/icons/adoption-e-xt-er-na-ll-in-ki-co-n';

import type { ReactNode } from 'react';

type StepResource = {
  href: string;
  label: string;
};

export default function StepCard({
  stepNumber,
  stepLabel,
  title,
  description,
  quote,
  visualLabel,
  resourcesLabel,
  resources,
  visualPosition,
  icon,
  imageSrc,
  cardBorderClassName,
  iconColorClassName,
  iconBackgroundClassName,
  quoteColorClassName,
  quoteBackgroundClassName,
  noVisualLabel,
}: {
  stepNumber: number;
  stepLabel: string;
  title: string;
  description: string[];
  quote: string;
  visualLabel: string;
  resourcesLabel: string;
  resources: StepResource[];
  visualPosition: 'left' | 'right';
  icon: ReactNode;
  imageSrc: string | null;
  cardBorderClassName: string;
  iconColorClassName: string;
  iconBackgroundClassName: string;
  quoteColorClassName: string;
  quoteBackgroundClassName: string;
  noVisualLabel: string;
}) {
  const isVisualRight = visualPosition === 'right';

  return (
    <article
      className={[
        'overflow-hidden rounded-4xl border border-l-4 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-md dark:bg-zinc-900',
        cardBorderClassName,
      ].join(' ')}
    >
      <div
        className={[
          'flex flex-col',
          isVisualRight ? 'lg:flex-row' : 'lg:flex-row-reverse',
        ].join(' ')}
      >
        <div className="flex w-full flex-col justify-center space-y-6 p-6 md:p-8 lg:w-3/5">
          <div>
            <div className="mb-3 flex items-center gap-4">
              <div
                className={[
                  'rounded-2xl p-3',
                  iconBackgroundClassName,
                  iconColorClassName,
                ].join(' ')}
              >
                {icon}
              </div>

              <div className="flex flex-col">
                <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {stepLabel} {stepNumber}
                </span>

                <h3 className="text-2xl font-bold leading-none text-slate-950 md:text-3xl dark:text-slate-50">
                  {title}
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-lg leading-relaxed text-slate-600 dark:text-slate-200">
              {description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <blockquote
            className={[
              'rounded-xl border-l-4 p-5 text-base font-medium italic',
              cardBorderClassName,
              quoteBackgroundClassName,
              quoteColorClassName,
            ].join(' ')}
          >
            {quote}
          </blockquote>

          <div className="border-t border-slate-200 pt-4 dark:border-zinc-700">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {resourcesLabel}
            </p>

            <div className="flex flex-wrap gap-3">
              {resources.map((resource) => (
                <Link
                  key={resource.href + resource.label}
                  href={resource.href}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
                >
                  {resource.label}
                  <ExternalLinkIcon />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-slate-200 bg-slate-50/70 p-6 dark:border-zinc-700 dark:bg-zinc-950/40 lg:w-2/5 lg:border-t-0">
          {imageSrc !== null ? (
            <div className="relative max-h-100 w-full overflow-hidden rounded-3xl border border-slate-200/50 shadow-sm dark:border-zinc-700 md:aspect-4/3 lg:h-full lg:aspect-auto">
              <Image
                src={imageSrc}
                alt={title}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
            </div>
          ) : (
            <div className="flex aspect-square max-h-100 w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white/70 text-slate-400 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-slate-500 md:aspect-4/3 lg:h-full lg:aspect-auto">
              <div
                className={[
                  'rounded-2xl p-4',
                  iconBackgroundClassName,
                  iconColorClassName,
                ].join(' ')}
              >
                {icon}
              </div>

              <p className="text-sm font-medium">{noVisualLabel || visualLabel}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
