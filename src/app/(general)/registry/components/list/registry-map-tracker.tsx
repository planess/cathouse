'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildSterilizationZones,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  ensureLeafletStyles,
  FOCUS_ZOOM,
  formatSeenAt,
  getZonePalette,
  normalizeText,
  toLatLngExpression,
} from './registry-map-tracker.helpers';

import type {
  RegistryAnimalMapRecord,
  RegistrySterilizationZone,
} from './types';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import type { ChangeEvent } from 'react';

export default function RegistryMapTracker() {
  const t = useTranslations('historypage');
  const locale = useLocale();
  const router = useRouter();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const pointsLayerRef = useRef<LayerGroup | null>(null);
  const zonesLayerRef = useRef<LayerGroup | null>(null);
  const requestIdRef = useRef(0);

  const [animals, setAnimals] = useState<RegistryAnimalMapRecord[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadAnimalsInViewport = useCallback(async () => {
    const map = mapRef.current;

    if (map === null) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const bounds = map.getBounds();
    const query = new URLSearchParams({
      north: bounds.getNorth().toString(),
      south: bounds.getSouth().toString(),
      east: bounds.getEast().toString(),
      west: bounds.getWest().toString(),
    });

    setIsLoading(true);
    setLoadFailed(false);

    try {
      const response = await fetch(`/api/registry/zones?${query.toString()}`, {
        cache: 'no-store',
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to load registry map data');
      }

      const payload = (await response.json()) as {
        animals?: RegistryAnimalMapRecord[];
      };

      if (requestId !== requestIdRef.current) {
        return;
      }

      const nextAnimals = Array.isArray(payload.animals) ? payload.animals : [];

      setAnimals(nextAnimals);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setAnimals([]);
      setLoadFailed(true);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    ensureLeafletStyles();

    let isMounted = true;

    void (async () => {
      if (!isMounted || mapContainerRef.current === null) {
        return;
      }

      const leaflet = await import('leaflet');

      if (!isMounted || mapContainerRef.current === null) {
        return;
      }

      const map = leaflet.map(mapContainerRef.current, {
        zoomControl: true,
      });
      mapRef.current = map;

      leaflet
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        })
        .addTo(map);

      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      const handleMapChanged = () => {
        void loadAnimalsInViewport();
      };

      map.on('moveend', handleMapChanged);

      void loadAnimalsInViewport();

      map.once('unload', () => {
        map.off('moveend', handleMapChanged);
      });
    })();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      pointsLayerRef.current = null;
      zonesLayerRef.current = null;
    };
  }, [loadAnimalsInViewport]);

  useEffect(() => {
    const map = mapRef.current;

    if (map === null) {
      return;
    }

    void (async () => {
      const leaflet = await import('leaflet');

      pointsLayerRef.current?.remove();
      zonesLayerRef.current?.remove();

      const pointLayerGroup = leaflet.layerGroup().addTo(map);
      pointsLayerRef.current = pointLayerGroup;

      const zoneLayerGroup = leaflet.layerGroup().addTo(map);
      zonesLayerRef.current = zoneLayerGroup;

      const zones: RegistrySterilizationZone[] =
        buildSterilizationZones(animals);

      for (const zone of zones) {
        const zoneColors = getZonePalette(zone.allSterilized);

        leaflet
          .circle(toLatLngExpression(zone.latitude, zone.longitude), {
            radius: zone.radius,
            color: zoneColors.stroke,
            fillColor: zoneColors.fill,
            fillOpacity: 0.14,
            weight: 2,
            interactive: false,
          })
          .bindTooltip(
            t('tracker.zoneAnimals', { count: zone.animalIds.length }),
            {
              direction: 'top',
              sticky: true,
            },
          )
          .addTo(zoneLayerGroup);
      }

      for (const animal of animals) {
        const markerStroke = animal.isSterilized ? '#15803d' : '#dc2626';

        const marker = leaflet
          .circleMarker(toLatLngExpression(animal.latitude, animal.longitude), {
            color: markerStroke,
            fillColor: '#ffffff',
            fillOpacity: 1,
            radius: 5,
            weight: 2,
          })
          .bindTooltip(animal.name, {
            direction: 'top',
            offset: [0, -8],
          });

        marker.on('click', () => {
          router.push(animal.detailsHref);
        });

        marker.addTo(pointLayerGroup);
      }
    })();
  }, [animals, router, t]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
    },
    [],
  );

  const handleDetectLocation = useCallback(() => {
    if (
      typeof navigator === 'undefined' ||
      navigator.geolocation === undefined
    ) {
      return;
    }

    if (mapRef.current === null) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current?.setView([latitude, longitude], FOCUS_ZOOM);
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, []);

  const filteredAnimals = useMemo(() => {
    const normalizedSearch = normalizeText(searchValue);

    if (normalizedSearch.length === 0) {
      return animals;
    }

    return animals.filter((animal) => {
      const haystack = normalizeText(
        `${animal.name} ${animal.species} ${animal.address}`,
      );

      return haystack.includes(normalizedSearch);
    });
  }, [animals, searchValue]);

  return (
    <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="border border-slate-200 bg-white rounded-3xl shadow-[0_22px_70px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 transition-colors overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 transition-colors">
              <span className="size-2 rounded-full bg-emerald-600" />
              {t('tracker.legend.sterilized')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-red-700 dark:bg-red-900/30 dark:text-red-200 transition-colors">
              <span className="size-2 rounded-full bg-red-500" />
              {t('tracker.legend.mixed')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDetectLocation}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {t('tracker.location.detectButton')}
            </button>
          </div>
        </div>

        <div
          ref={mapContainerRef}
          className="h-105 w-full"
          aria-label={t('tracker.mapAriaLabel')}
          style={{zIndex: 5}}
        />
      </div>

      <div
        className={clsx(
          'border border-slate-200 bg-white rounded-3xl flex min-h-105 flex-col px-4 py-4 xl:px-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 transition-colors transition-opacity overflow-hidden',
          { 'opacity-50': isLoading },
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors">
              {t('tracker.visibleAnimals')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 transition-colors">
              {t('tracker.animalsInView', { count: animals.length })}
            </p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900 transition-colors">
            {animals.length}
          </span>
        </div>

        {loadFailed && (
          <p className="mb-2 text-xs text-rose-600 dark:text-rose-300 transition-colors">
            {t('tracker.loadError')}
          </p>
        )}

        <input
          type="search"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={t('tracker.searchPlaceholder')}
          className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />

        <div className="flex-1 overflow-auto pr-1">
          {filteredAnimals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300 transition-colors">
              {t('tracker.empty')}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredAnimals.map((animal) => (
                <Link
                  key={animal.id}
                  href={animal.detailsHref}
                  className="group rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-500"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-slate-950 dark:text-slate-100">
                      {animal.name}
                    </h3>
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        animal.isSterilized
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
                      )}
                    >
                      {animal.isSterilized
                        ? t('tracker.status.sterilized')
                        : t('tracker.status.notSterilized')}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 transition-colors">
                    {animal.species} • {t(`personal.status.${animal.status}`)}
                  </p>

                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                    {animal.address ?? t('tracker.addressFallback')}
                  </p>

                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
                    {t('tracker.seenAt', {
                      value: formatSeenAt(
                        animal.observedAt,
                        locale,
                        t('tracker.dateUnknown'),
                      ),
                    })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
