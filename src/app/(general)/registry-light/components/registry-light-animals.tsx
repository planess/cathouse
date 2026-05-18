'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { formatLabel } from '../../registry/components/card/card.helpers';
import {
  formatRegistryLightSeenLabel,
  getRegistryLightAgeLabel,
} from '../helpers/registry-light-card.helpers';
import { REGISTRY_LIGHT_ANIMALS_BATCH_SIZE } from '../registry-light.constants';

import RegistryLightCard from './registry-light-card';

import type {
  RegistryLightAnimalRecord,
  RegistryLightAnimalsPage,
  RegistryLightAnimalsProps,
} from '../types/registry-light.types';

export default function RegistryLightAnimals({
  initialPage,
  statusFilter,
}: RegistryLightAnimalsProps) {
  const [animals, setAnimals] = useState<RegistryLightAnimalRecord[]>(
    initialPage.animals,
  );
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(initialPage.hasMore);
  const offsetRef = useRef(initialPage.animals.length);
  const t = useTranslations('registryLightPage');
  const historyT = useTranslations('historypage');
  const locale = useLocale();

  const loadMoreAnimals = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setLoadError(null);

    try {
      const searchParams = new URLSearchParams({
        offset: offsetRef.current.toString(),
        limit: REGISTRY_LIGHT_ANIMALS_BATCH_SIZE.toString(),
      });

      if (statusFilter !== null) {
        searchParams.set('status', statusFilter);
      }

      const response = await fetch(
        `/api/registry-light?${searchParams.toString()}`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to load registry light animals.');
      }

      const nextPage = (await response.json()) as RegistryLightAnimalsPage;

      setAnimals((currentAnimals) => {
        const nextAnimals = [...currentAnimals, ...nextPage.animals];

        offsetRef.current = nextAnimals.length;

        return nextAnimals;
      });
      setHasMore(nextPage.hasMore);
      hasMoreRef.current = nextPage.hasMore;
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Failed to load registry light animals.',
      );
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const sentinelElement = sentinelRef.current;

    if (sentinelElement === null || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreAnimals();
        }
      },
      {
        rootMargin: '240px 0px',
      },
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, animals.length, loadMoreAnimals]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {animals.map((animal) => {
          const seenValue = formatRegistryLightSeenLabel(
            animal.lastSeenAt,
            locale,
            t,
          );

          return (
            <RegistryLightCard
              key={animal.id}
              animal={animal}
              age={
                animal.age === null
                  ? null
                  : getRegistryLightAgeLabel(animal.age, t)
              }
              statusLabel={
                animal.status !== 'unknown'
                  ? formatLabel(animal.status, historyT)
                  : null
              }
              seenLabel={t('cards.seenLabel')}
              seenValue={seenValue}
              descriptionFallback={t('cards.descriptionFallback')}
            />
          );
        })}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      )}

      {(isLoading || loadError !== null) && (
        <div className="flex justify-center">
          {loadError === null ? (
            <p className="rounded-full border border-[#d7e5df] bg-white/90 px-4 py-2 text-sm font-medium text-[#516d68] shadow-[0_10px_24px_rgba(55,84,72,0.08)]">
              {t('loadingMore')}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#f0d4d4] bg-white/95 px-5 py-4 text-center shadow-[0_10px_24px_rgba(55,84,72,0.08)]">
              <p className="text-sm text-[#8b4b4b]">{t('loadMoreError')}</p>
              <button
                type="button"
                onClick={() => {
                  void loadMoreAnimals();
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#4a9c72] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#408966]"
              >
                {t('retryLoadMore')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
