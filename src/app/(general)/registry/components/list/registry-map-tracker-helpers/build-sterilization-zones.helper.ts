import { buildComponentZone } from './build-component-zone.helper';
import { calculateDistanceMeters } from './calculate-distance-meters.helper';
import { CONNECT_DISTANCE_METERS } from './constants';
import { hasCoordinates } from './has-coordinates.helper';

import type {
  RegistryAnimalMapRecord,
  RegistrySterilizationZone,
} from '../types';
import type { RegistryAnimalMapRecordWithCoordinates } from './types';

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
