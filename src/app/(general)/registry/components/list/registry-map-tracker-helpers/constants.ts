import type { LatLngTuple } from 'leaflet';

export const LEAFLET_CSS_ID = 'leaflet-css';
export const LEAFLET_TRACKER_STYLE_ID = 'registry-map-leaflet-style';
export const LEAFLET_TRACKER_STYLE_CONTENT = `
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

export const zonePalette = {
  sterilized: {
    stroke: '#15803d',
    fill: '#22c55e',
  },
  mixed: {
    stroke: '#dc2626',
    fill: '#f97316',
  },
} as const;
