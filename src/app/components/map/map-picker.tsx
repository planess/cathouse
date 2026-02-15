'use client';

import { useEffect, useRef } from 'react';

import type { MapCoordinates } from '@app/(admin)/admin/inventory/types/inventory.types';

import type { Icon, Map as LeafletMap, Marker } from 'leaflet';

type SharedMapPickerProps = {
  value: MapCoordinates;
  onChange: (coords: MapCoordinates) => void;
  ariaLabel: string;
  hint: string;
  className?: string;
};

const LEAFLET_CSS_ID = 'leaflet-css';
const DEFAULT_COORDINATES: [number, number] = [49.8397, 24.0297];

export function MapPicker({
  value,
  onChange,
  ariaLabel,
  hint,
  className = 'h-48 w-full rounded-2xl border border-slate-200',
}: SharedMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const iconRef = useRef<Icon | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (document.getElementById(LEAFLET_CSS_ID)) {
      return;
    }

    const link = document.createElement('link');
    link.id = LEAFLET_CSS_ID;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
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

      if (value.latitude !== null && value.longitude !== null) {
        map.setView([value.latitude, value.longitude], 13);
      } else {
        map.setView(DEFAULT_COORDINATES, 12);
      }

      map.on('click', (event) => {
        const { lat, lng } = event.latlng;

        onChangeRef.current({
          latitude: normalizeCoordinate(lat),
          longitude: normalizeCoordinate(lng),
        });
      });
    })();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [value.latitude, value.longitude]);

  useEffect(() => {
    if (!leafletRef.current || !mapRef.current) {
      return;
    }

    if (value.latitude === null || value.longitude === null) {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current.setView(DEFAULT_COORDINATES, 12);
      return;
    }

    iconRef.current ??= leafletRef.current.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const markerCoordinates: [number, number] = [
      value.latitude,
      value.longitude,
    ];

    if (!markerRef.current) {
      markerRef.current = leafletRef.current
        .marker(markerCoordinates, { icon: iconRef.current })
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(markerCoordinates);
    }

    mapRef.current.setView(
      markerCoordinates,
      Math.max(mapRef.current.getZoom(), 13),
    );
  }, [value.latitude, value.longitude]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className={className} aria-label={ariaLabel} />
      {value.latitude === null || value.longitude === null ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function normalizeCoordinate(value: number) {
  return Math.round(value * 100000) / 100000;
}
