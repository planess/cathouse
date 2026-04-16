import { toRadians } from './to-radians.helper';

import type { RegistryAnimalMapRecordWithCoordinates } from './types';

export function calculateDistanceMeters(
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
