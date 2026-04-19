import type {
  Circle as LeafletCircle,
  CircleMarker as LeafletCircleMarker,
} from 'leaflet';

export type RegistryMapTrackerProps = {
  isVolunteer: boolean;
};

export type MarkerEntry = {
  marker: LeafletCircleMarker;
  strokeColor: string;
  fillColor: string;
  radius: number;
  weight: number;
};

export type ZoneEntry = {
  zone: LeafletCircle;
  strokeColor: string;
  fillColor: string;
  fillOpacity: number;
  weight: number;
};
