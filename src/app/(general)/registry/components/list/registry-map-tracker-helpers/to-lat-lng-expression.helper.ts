import type { LatLngExpression } from 'leaflet';

export function toLatLngExpression(
  latitude: number,
  longitude: number,
): LatLngExpression {
  return [latitude, longitude];
}
