import { calculateDistanceMeters } from './calculate-distance-meters.helper';
import { MIN_ZONE_RADIUS_METERS, ZONE_PADDING_METERS } from './constants';

import type { RegistryAnimalMapRecordWithCoordinates } from './types';

export function buildComponentZone(
  component: RegistryAnimalMapRecordWithCoordinates[],
) {
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
