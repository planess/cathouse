'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import type { Icon, Map as LeafletMap, Marker } from 'leaflet';

export type LocationValue = {
  latitude: number;
  longitude: number;
  address: string;
};

type LocationFieldProps = {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  label: string;
  description?: string;
  detectLabel: string;
  detectingLabel: string;
  detectedLabel: string;
  detectErrorLabel: string;
  unsupportedLabel: string;
  addressLabel: string;
  addressPlaceholder: string;
  coordinatesLabel: string;
  clearLabel: string;
  idleLabel: string;
};

const LEAFLET_CSS_ID = 'leaflet-css';
const DEFAULT_COORDINATES: [number, number] = [49.8397, 24.0297];

export function LocationField({
  value,
  onChange,
  label,
  description,
  detectLabel,
  detectingLabel,
  detectedLabel,
  detectErrorLabel,
  unsupportedLabel,
  addressLabel,
  addressPlaceholder,
  coordinatesLabel,
  clearLabel,
  idleLabel,
}: LocationFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const iconRef = useRef<Icon | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const locationRef = useRef<LocationValue | null>(value);
  const [statusMessage, setStatusMessage] = useState(idleLabel);
  const [isLocating, setIsLocating] = useState(false);

  const ensureLeafletStyles = useCallback(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (document.querySelector(`#${LEAFLET_CSS_ID}`)) {
      return;
    }

    const link = document.createElement('link');
    link.id = LEAFLET_CSS_ID;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  const getMarkerIcon = useCallback((leaflet: typeof import('leaflet')) => {
    iconRef.current ??= leaflet.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    return iconRef.current;
  }, []);

  const updateMarker = useCallback(
    (latitude: number, longitude: number) => {
      if (!leafletRef.current || !mapRef.current) {
        return;
      }

      const leaflet = leafletRef.current;
      const coordinates: [number, number] = [latitude, longitude];

      if (!markerRef.current) {
        markerRef.current = leaflet
          .marker(coordinates, { icon: getMarkerIcon(leaflet) })
          .addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng(coordinates);
      }

      mapRef.current.setView(
        coordinates,
        Math.max(mapRef.current.getZoom(), 13),
      );
    },
    [getMarkerIcon],
  );

  const clearMarker = useCallback(() => {
    markerRef.current?.remove();
    markerRef.current = null;
  }, []);

  useEffect(() => {
    ensureLeafletStyles();

    let isMounted = true;

    void (async () => {
      const leaflet = await import('leaflet');

      if (!isMounted || !containerRef.current) {
        return;
      }

      leafletRef.current = leaflet;
      const map = leaflet.map(containerRef.current);
      mapRef.current = map;

      leaflet
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        })
        .addTo(map);

      map.setView(DEFAULT_COORDINATES, 12);

      if (locationRef.current) {
        updateMarker(
          locationRef.current.latitude,
          locationRef.current.longitude,
        );
        setStatusMessage(detectedLabel);
      }

      map.on('click', (event) => {
        const { lat, lng } = event.latlng;
        onChange({
          latitude: lat,
          longitude: lng,
          address: locationRef.current?.address ?? '',
        });
        setStatusMessage(detectedLabel);
        updateMarker(lat, lng);
      });
    })();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [detectedLabel, ensureLeafletStyles, onChange, updateMarker]);

  useEffect(() => {
    if (value) {
      updateMarker(value.latitude, value.longitude);
    } else {
      clearMarker();
      setStatusMessage(idleLabel);
    }
  }, [clearMarker, idleLabel, updateMarker, value]);

  useEffect(() => {
    locationRef.current = value;
  }, [value]);

  const handleDetectLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatusMessage(unsupportedLabel);
      return;
    }

    setIsLocating(true);
    setStatusMessage(detectingLabel);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({
          latitude,
          longitude,
          address: locationRef.current?.address ?? '',
        });
        setStatusMessage(detectedLabel);
        updateMarker(latitude, longitude);
        setIsLocating(false);
      },
      () => {
        setStatusMessage(detectErrorLabel);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [
    detectErrorLabel,
    detectedLabel,
    detectingLabel,
    onChange,
    updateMarker,
    unsupportedLabel,
  ]);

  useEffect(() => {
    handleDetectLocation();
  }, [handleDetectLocation]);

  const handleAddressChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!locationRef.current) {
        return;
      }

      onChange({ ...locationRef.current, address: event.target.value });
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    clearMarker();
    onChange(null);
    setStatusMessage(idleLabel);
  }, [clearMarker, idleLabel, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 transition-colors">
            {label}
          </p>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
              {description}
            </p>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-rose-600 transition-colors hover:text-rose-700"
          >
            {clearLabel}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200">
        <div ref={containerRef} className="h-64 w-full rounded-t-2xl" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm">
          <p className="text-slate-600 dark:text-slate-400 transition-colors">
            {statusMessage}
          </p>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 dark:text-slate-400 disabled:opacity-60"
          >
            {isLocating ? detectingLabel : detectLabel}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900 dark:text-slate-200 transition-colors">
          {addressLabel}
        </label>
        <input
          type="text"
          value={value?.address ?? ''}
          onChange={handleAddressChange}
          placeholder={addressPlaceholder}
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:bg-stone-700 dark:text-stone-50 transition-colors"
          disabled={!value}
        />
      </div>

      {value && (
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300 transition-colors">
          {coordinatesLabel}: {value.latitude.toFixed(5)},{' '}
          {value.longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
}
