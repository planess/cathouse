'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  formatSexLabel,
  getAgeLabel,
} from '@app/(general)/registry/components/card/card.helpers';
import { CheckboxGroup } from '@app/components/checkbox-group';

import {
  buildSterilizationZones,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  ensureLeafletStyles,
  FOCUS_ZOOM,
  formatSeenAt,
  getZonePalette,
  hasCoordinates,
  MIN_ZOOM,
  normalizeText,
  toLatLngExpression,
} from './registry-map-tracker-helpers';

import type {
  MarkerEntry,
  RegistryMapTrackerProps,
  ZoneEntry,
} from './registry-map-tracker.types';
import type {
  RegistryAnimalMapRecord,
  RegistrySterilizationZone,
} from './types';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import type { ChangeEvent } from 'react';

const ONLY_DRAFT_FILTER_VALUE = 'only-draft';
const HOVER_MARKER_STROKE = '#f59e0b';
const HOVER_MARKER_FILL = '#fef08a';
const HOVER_MARKER_RADIUS = 8;
const HOVER_MARKER_WEIGHT = 3;
const HOVER_ZONE_STROKE = '#f59e0b';
const HOVER_ZONE_FILL = '#fbbf24';
const HOVER_ZONE_FILL_OPACITY = 0.22;
const HOVER_ZONE_WEIGHT = 3;

function parseBirthday(value: string | null): Date | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export default function RegistryMapTracker({
  isVolunteer,
}: RegistryMapTrackerProps) {
  const t = useTranslations('historypage');
  const tCard = useTranslations('historypage.card');
  const locale = useLocale();
  const router = useRouter();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const pointsLayerRef = useRef<LayerGroup | null>(null);
  const zonesLayerRef = useRef<LayerGroup | null>(null);
  const markerByAnimalIdRef = useRef<Map<string, MarkerEntry>>(new Map());
  const zoneByAnimalIdRef = useRef<Map<string, ZoneEntry>>(new Map());
  const highlightedAnimalIdRef = useRef<string | null>(null);
  const onlyOwnDraftRef = useRef(false);
  const requestIdRef = useRef(0);
  const shouldReloadAfterMoveRef = useRef(false);

  const [animals, setAnimals] = useState<RegistryAnimalMapRecord[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isOnlyDraftEnabled, setIsOnlyDraftEnabled] = useState(false);
  const [hoveredAnimalId, setHoveredAnimalId] = useState<string | null>(null);
  const [layerRenderVersion, setLayerRenderVersion] = useState(0);

  const isRenderOnlyDraftState = isVolunteer && isOnlyDraftEnabled;

  useEffect(() => {
    onlyOwnDraftRef.current = isRenderOnlyDraftState;
  }, [isRenderOnlyDraftState]);

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

    if (onlyOwnDraftRef.current) {
      query.set('onlyOwnDraft', 'true');
    }

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

  const resetHoverStyles = useCallback((animalId: string | null) => {
    if (animalId === null) {
      return;
    }

    const markerEntry = markerByAnimalIdRef.current.get(animalId);

    if (markerEntry !== undefined) {
      markerEntry.marker.setStyle({
        color: markerEntry.strokeColor,
        fillColor: markerEntry.fillColor,
        weight: markerEntry.weight,
      });
      markerEntry.marker.setRadius(markerEntry.radius);
      markerEntry.marker
        .getElement()
        ?.classList.remove('registry-map-hover-glow');
    }

    const zoneEntry = zoneByAnimalIdRef.current.get(animalId);

    if (zoneEntry !== undefined) {
      zoneEntry.zone.setStyle({
        color: zoneEntry.strokeColor,
        fillColor: zoneEntry.fillColor,
        fillOpacity: zoneEntry.fillOpacity,
        weight: zoneEntry.weight,
      });
      zoneEntry.zone
        .getElement()
        ?.classList.remove('registry-map-hover-zone-glow');
    }
  }, []);

  const applyHoverStyles = useCallback((animalId: string | null) => {
    if (animalId === null) {
      return;
    }

    const markerEntry = markerByAnimalIdRef.current.get(animalId);

    if (markerEntry !== undefined) {
      markerEntry.marker.setStyle({
        color: HOVER_MARKER_STROKE,
        fillColor: HOVER_MARKER_FILL,
        weight: HOVER_MARKER_WEIGHT,
      });
      markerEntry.marker.setRadius(HOVER_MARKER_RADIUS);
      markerEntry.marker.getElement()?.classList.add('registry-map-hover-glow');
      markerEntry.marker.bringToFront();
    }

    const zoneEntry = zoneByAnimalIdRef.current.get(animalId);

    if (zoneEntry !== undefined) {
      zoneEntry.zone.setStyle({
        color: HOVER_ZONE_STROKE,
        fillColor: HOVER_ZONE_FILL,
        fillOpacity: HOVER_ZONE_FILL_OPACITY,
        weight: HOVER_ZONE_WEIGHT,
      });
      zoneEntry.zone
        .getElement()
        ?.classList.add('registry-map-hover-zone-glow');
      zoneEntry.zone.bringToFront();
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
        minZoom: MIN_ZOOM,
        zoomControl: true,
      });
      mapRef.current = map;

      leaflet
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        })
        .addTo(map);

      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      const markNextMoveAsReloadable = () => {
        shouldReloadAfterMoveRef.current = true;
      };

      const handleMapChanged = () => {
        if (!shouldReloadAfterMoveRef.current) {
          return;
        }

        shouldReloadAfterMoveRef.current = false;
        void loadAnimalsInViewport();
      };

      map.on('moveend', handleMapChanged);
      map.on('dragstart', markNextMoveAsReloadable);
      map.on('zoomstart', markNextMoveAsReloadable);

      void loadAnimalsInViewport();

      map.once('unload', () => {
        map.off('moveend', handleMapChanged);
        map.off('dragstart', markNextMoveAsReloadable);
        map.off('zoomstart', markNextMoveAsReloadable);
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
      const animalsWithCoordinates = animals.filter(hasCoordinates);

      pointsLayerRef.current?.remove();
      zonesLayerRef.current?.remove();
      markerByAnimalIdRef.current.clear();
      zoneByAnimalIdRef.current.clear();

      const pointLayerGroup = leaflet.layerGroup().addTo(map);
      pointsLayerRef.current = pointLayerGroup;

      const zoneLayerGroup = leaflet.layerGroup().addTo(map);
      zonesLayerRef.current = zoneLayerGroup;

      const zones: RegistrySterilizationZone[] = buildSterilizationZones(
        animalsWithCoordinates,
      );

      for (const zone of zones) {
        const zoneColors = getZonePalette(zone.allSterilized);

        const zoneStyle = {
          color: zoneColors.stroke,
          fillColor: zoneColors.fill,
          fillOpacity: 0.14,
          weight: 2,
        };

        const zoneCircle = leaflet
          .circle(toLatLngExpression(zone.latitude, zone.longitude), {
            radius: zone.radius,
            ...zoneStyle,
            interactive: false,
            className: 'registry-map-zone',
          })
          .bindTooltip(
            t('tracker.zoneAnimals', { count: zone.animalIds.length }),
            {
              direction: 'top',
              sticky: true,
            },
          );

        zoneCircle.addTo(zoneLayerGroup);

        for (const animalId of zone.animalIds) {
          zoneByAnimalIdRef.current.set(animalId, {
            zone: zoneCircle,
            strokeColor: zoneStyle.color,
            fillColor: zoneStyle.fillColor,
            fillOpacity: zoneStyle.fillOpacity,
            weight: zoneStyle.weight,
          });
        }
      }

      for (const animal of animalsWithCoordinates) {
        const markerStroke = animal.isSterilized ? '#15803d' : '#dc2626';

        const markerStyle = {
          color: markerStroke,
          fillColor: '#ffffff',
          fillOpacity: 1,
          radius: 5,
          weight: 2,
          className: 'registry-map-marker',
        };

        const marker = leaflet
          .circleMarker(toLatLngExpression(animal.latitude, animal.longitude), {
            ...markerStyle,
          })
          .bindTooltip(animal.name, {
            direction: 'top',
            offset: [0, -8],
          });

        marker.on('click', () => {
          router.push(animal.detailsHref);
        });

        marker.addTo(pointLayerGroup);
        markerByAnimalIdRef.current.set(animal.id, {
          marker,
          strokeColor: markerStyle.color,
          fillColor: markerStyle.fillColor,
          radius: markerStyle.radius,
          weight: markerStyle.weight,
        });
      }

      setLayerRenderVersion((current) => current + 1);
    })();
  }, [animals, router, t]);

  useEffect(() => {
    resetHoverStyles(highlightedAnimalIdRef.current);
    applyHoverStyles(hoveredAnimalId);
    highlightedAnimalIdRef.current = hoveredAnimalId;
  }, [applyHoverStyles, hoveredAnimalId, layerRenderVersion, resetHoverStyles]);

  useEffect(() => {
    if (mapRef.current === null) {
      return;
    }

    void loadAnimalsInViewport();
  }, [isRenderOnlyDraftState, loadAnimalsInViewport]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
    },
    [],
  );

  const handleDraftFilterChange = useCallback((nextValues: string[]) => {
    setIsOnlyDraftEnabled(nextValues.includes(ONLY_DRAFT_FILTER_VALUE));
  }, []);

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
        shouldReloadAfterMoveRef.current = true;
        mapRef.current?.setView([latitude, longitude], FOCUS_ZOOM);
      },
      () => {
        setLoadFailed(true);
      },
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
        `${animal.name} ${animal.sex} ${animal.address}`,
      );

      return haystack.includes(normalizedSearch);
    });
  }, [animals, searchValue]);

  return (
    <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div
        className={clsx(
          'flex h-[65dvh] flex-col border border-slate-200 bg-white rounded-3xl shadow-[0_22px_70px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 transition-colors overflow-hidden',
          {
            'shadow-[0_22px_70px_rgba(15,23,42,0.08),0_0_0_1px_rgba(148,163,184,0.4)_inset] dark:shadow-[0_22px_70px_rgba(2,6,23,0.35),0_0_0_1px_rgba(148,163,184,0.45)_inset]':
              isRenderOnlyDraftState,
          },
        )}
      >
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
            {isVolunteer && (
              <CheckboxGroup
                id="tracker-only-draft"
                options={[
                  {
                    value: ONLY_DRAFT_FILTER_VALUE,
                    label: t('tracker.onlyDraft.label'),
                  },
                ]}
                value={isOnlyDraftEnabled ? [ONLY_DRAFT_FILTER_VALUE] : []}
                onChange={handleDraftFilterChange}
                className="min-w-34 rounded-xl border-slate-300 bg-white/80 dark:border-slate-600 dark:bg-slate-700/60"
                optionClassName="min-w-0 rounded-xl px-3 py-2"
              />
            )}

            <button
              type="button"
              onClick={handleDetectLocation}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {t('tracker.location.detectButton')}
            </button>
          </div>
        </div>

        <div className="relative w-full flex-1">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
            aria-label={t('tracker.mapAriaLabel')}
            style={{ zIndex: 5 }}
          />
          {isRenderOnlyDraftState && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-slate-200/25 dark:bg-slate-200/10"
            />
          )}
        </div>
      </div>

      <div
        className={clsx(
          'border border-slate-200 bg-white rounded-3xl flex h-[70dvh] xl:h-[65dvh] flex-col px-4 py-4 xl:px-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 transition-colors overflow-hidden',
          {
            'shadow-[0_22px_70px_rgba(15,23,42,0.08),0_0_0_1px_rgba(148,163,184,0.4)_inset] dark:shadow-[0_22px_70px_rgba(2,6,23,0.35),0_0_0_1px_rgba(148,163,184,0.45)_inset]':
              isRenderOnlyDraftState,
          },
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
                  onMouseEnter={() => {
                    setHoveredAnimalId(animal.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredAnimalId(null);
                  }}
                  onFocus={() => {
                    setHoveredAnimalId(animal.id);
                  }}
                  onBlur={() => {
                    setHoveredAnimalId(null);
                  }}
                  className="group rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-500"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
                      <Image
                        src={animal.previewImage}
                        alt={`${animal.name} preview`}
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
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
                        {formatSexLabel(animal.sex, tCard)} •{' '}
                        {getAgeLabel(parseBirthday(animal.birthday), tCard)} •{' '}
                        {t(`personal.status.${animal.status}`)}
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
