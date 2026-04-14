import type {
  RegistryAnimalMapRecord,
  RegistrySterilizationZone,
} from './types';
import type { LatLngExpression, LatLngTuple } from 'leaflet';

const LEAFLET_CSS_ID = 'leaflet-css';

export const DEFAULT_CENTER: LatLngTuple = [49.8397, 24.0297];
export const DEFAULT_ZOOM = 6;
export const MAX_ZOOM = 10;
export const FOCUS_ZOOM = MAX_ZOOM;
export const CONNECT_DISTANCE_METERS = 10;
export const MIN_ZONE_RADIUS_METERS = 8;
export const ZONE_PADDING_METERS = 4;

const zonePalette = {
  sterilized: {
    stroke: '#15803d',
    fill: '#22c55e',
  },
  mixed: {
    stroke: '#dc2626',
    fill: '#f97316',
  },
} as const;

export function ensureLeafletStyles() {
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
}

export function getZonePalette(allSterilized: boolean) {
  return allSterilized ? zonePalette.sterilized : zonePalette.mixed;
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function toLatLngExpression(
  latitude: number,
  longitude: number,
): LatLngExpression {
  return [latitude, longitude];
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(
  left: RegistryAnimalMapRecord,
  right: RegistryAnimalMapRecord,
) {
  const earthRadius = 6_371_000;
  const latDelta = toRadians(right.latitude - left.latitude);
  const lonDelta = toRadians(right.longitude - left.longitude);
  const leftLat = toRadians(left.latitude);
  const rightLat = toRadians(right.latitude);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(leftLat) * Math.cos(rightLat) * Math.sin(lonDelta / 2) ** 2;
  const angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadius * angle;
}

function buildComponentZone(component: RegistryAnimalMapRecord[]) {
  const latitude =
    component.reduce((sum, animal) => sum + animal.latitude, 0) /
    component.length;
  const longitude =
    component.reduce((sum, animal) => sum + animal.longitude, 0) /
    component.length;

  const centerRecord = {
    latitude,
    longitude,
  };

  const maxDistance = component.reduce((maxRadius, animal) => {
    const distance = calculateDistanceMeters(
      {
        ...animal,
        latitude: centerRecord.latitude,
        longitude: centerRecord.longitude,
      },
      animal,
    );

    return Math.max(maxRadius, distance);
  }, 0);

  const animalIds = component.map((animal) => animal.id);

  return {
    id: `zone-${animalIds.join('-')}`,
    animalIds,
    latitude,
    longitude,
    radius: Math.max(MIN_ZONE_RADIUS_METERS, maxDistance + ZONE_PADDING_METERS),
    allSterilized: component.every((animal) => animal.isSterilized),
  };
}

export function buildSterilizationZones(
  animals: RegistryAnimalMapRecord[],
): RegistrySterilizationZone[] {
  if (animals.length === 0) {
    return [];
  }

  const visited = new Set<number>();
  const zones: RegistrySterilizationZone[] = [];

  for (const [startIndex, startAnimal] of animals.entries()) {
    if (visited.has(startIndex)) {
      continue;
    }

    const stack = [startIndex];
    const component: RegistryAnimalMapRecord[] = [];

    visited.add(startIndex);
    component.push(startAnimal);

    while (stack.length > 0) {
      const currentIndex = stack.pop();

      if (typeof currentIndex !== 'number') {
        continue;
      }

      const currentAnimal = animals[currentIndex];

      for (const [nextIndex, nextAnimal] of animals.entries()) {
        if (visited.has(nextIndex)) {
          continue;
        }

        const distance = calculateDistanceMeters(currentAnimal, nextAnimal);

        if (distance > CONNECT_DISTANCE_METERS) {
          continue;
        }

        visited.add(nextIndex);
        stack.push(nextIndex);
        component.push(nextAnimal);
      }
    }

    zones.push(buildComponentZone(component));
  }

  return zones;
}

export function formatSeenAt(
  observedAt: string | null,
  locale: string,
  fallback: string,
) {
  if (observedAt === null || observedAt.trim() === '') {
    return fallback;
  }

  const parsed = new Date(observedAt);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}
