import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import { statusTone } from '@app/(general)/registry/components/card/card.helpers';

import type { RegistryLightAnimalRecord } from '../types/registry-light.types';

type RegistryLightCardProps = {
  animal: RegistryLightAnimalRecord;
  age: string | null;
  statusLabel: string | null;
  seenLabel: string;
  seenValue: string;
  descriptionFallback: string;
};

function SpeciesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M6.417 6.833a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM13.583 6.833a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM4.667 11a1.417 1.417 0 1 0 0-2.834 1.417 1.417 0 0 0 0 2.834ZM15.333 11a1.417 1.417 0 1 0 0-2.834 1.417 1.417 0 0 0 0 2.834Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 15.833c2.026 0 3.333-1.078 3.333-2.417 0-1.062-.844-1.916-1.884-1.916-.658 0-1.04.167-1.449.478-.409-.311-.791-.478-1.449-.478-1.04 0-1.884.854-1.884 1.916 0 1.34 1.307 2.417 3.333 2.417Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M5.833 3.75v2.083M14.167 3.75v2.083M4.583 6.667h10.834M5.5 16.25h9c.92 0 1.667-.746 1.667-1.667V6.25c0-.92-.746-1.667-1.667-1.667h-9c-.92 0-1.667.746-1.667 1.667v8.333c0 .92.746 1.667 1.667 1.667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RegistryLightCard({
  animal,
  age,
  statusLabel,
  seenLabel,
  seenValue,
  descriptionFallback,
}: RegistryLightCardProps) {
  const nameText = animal.name.trim() === '' ? 'Unnamed' : animal.name;
  const descriptionText =
    animal.description === null || animal.description.trim() === ''
      ? descriptionFallback
      : animal.description;

  return (
    <Link
      href={`/registry/${animal.id}`}
      className="block h-full focus-visible:outline-none"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#dce7e1] dark:border-[#2d4a3e] bg-white dark:bg-[#1a2e27] shadow-[0_16px_40px_rgba(55,84,72,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.30)] transition-[transform,colors] duration-300 hover:-translate-y-1">
        <div className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800">
          <Image
            src={animal.previewImage}
            alt={nameText}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            {age !== null && age !== '' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#1a2e27] px-3 py-1 text-sm font-semibold text-[#243935] dark:text-[#c8ddd8] shadow-[0_2px_8px_rgba(36,57,53,0.12)]">
                <SpeciesIcon />
                {age}
              </span>
            )}
            {statusLabel !== null && statusLabel !== '' && (
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-sm font-semibold shadow-[0_2px_8px_rgba(36,57,53,0.12)]',
                  statusTone[animal.status],
                )}
              >
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5 md:p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#122926] dark:text-[#e0ede9] transition-colors">
              {nameText}
            </h2>
            <p className="text-sm leading-6 text-[#516d68] dark:text-[#8aa9a1] transition-colors">
              {descriptionText}
            </p>
          </div>

          <div className="mt-auto border-t border-[#dfe8e2] dark:border-[#2d4a3e] pt-4 text-[11px] text-[#6a827d] dark:text-[#6a9088] transition-colors">
            <div className="flex items-center gap-2">
              <CalendarIcon />
              <div className="flex flex-col gap-1 font-semibold uppercase tracking-[0.12em] text-[#8aa09b] dark:text-[#6a9088]">
                <span>{seenLabel}:</span>
                <span>{seenValue}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
