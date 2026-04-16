import type {
  RegistryAnimalMapRecord,
  RegistrySterilizationZone,
} from './types';
import type { LatLngExpression, LatLngTuple } from 'leaflet';

const LEAFLET_CSS_ID = 'leaflet-css';
const LEAFLET_TRACKER_STYLE_ID = 'registry-map-leaflet-style';
const LEAFLET_TRACKER_STYLE_CONTENT = `
.registry-map-hover-glow {
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.95));
}

.registry-map-hover-zone-glow {
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.75));
}
`;

export const DEFAULT_CENTER: LatLngTuple = [49.8397, 24.0297];
export const MIN_ZOOM = 14;
export const DEFAULT_ZOOM = 15;
export const FOCUS_ZOOM = MIN_ZOOM;
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

  if (!document.querySelector(`#${LEAFLET_CSS_ID}`)) {
    const link = document.createElement('link');
    link.id = LEAFLET_CSS_ID;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  if (document.querySelector(`#${LEAFLET_TRACKER_STYLE_ID}`)) {
    return;
  }

  const style = document.createElement('style');
  style.id = LEAFLET_TRACKER_STYLE_ID;
  style.textContent = LEAFLET_TRACKER_STYLE_CONTENT;
  document.head.appendChild(style);
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

type RegistryAnimalMapRecordWithCoordinates = RegistryAnimalMapRecord & {
  latitude: number;
  longitude: number;
};

function hasCoordinates(
  animal: RegistryAnimalMapRecord,
): animal is RegistryAnimalMapRecordWithCoordinates {
  return (
    typeof animal.latitude === 'number' && Number.isFinite(animal.latitude) &&
    typeof animal.longitude === 'number' && Number.isFinite(animal.longitude)
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(
  left: RegistryAnimalMapRecordWithCoordinates,
  right: RegistryAnimalMapRecordWithCoordinates,
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

function buildComponentZone(component: RegistryAnimalMapRecordWithCoordinates[]) {
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
  const animalsWithCoordinates = animals.filter(hasCoordinates);

  if (animalsWithCoordinates.length === 0) {
    return [];
  }

  const visited = new Set<number>();
  const zones: RegistrySterilizationZone[] = [];

  for (const [startIndex, startAnimal] of animalsWithCoordinates.entries()) {
    if (visited.has(startIndex)) {
      continue;
    }

    const stack = [startIndex];
    const component: RegistryAnimalMapRecordWithCoordinates[] = [];

    visited.add(startIndex);
    component.push(startAnimal);

    while (stack.length > 0) {
      const currentIndex = stack.pop();

      if (typeof currentIndex !== 'number') {
        continue;
      }

      const currentAnimal = animalsWithCoordinates[currentIndex];

      for (const [nextIndex, nextAnimal] of animalsWithCoordinates.entries()) {
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
