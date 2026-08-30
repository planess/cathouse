import type { NextRequest } from 'next/server';

export type RegistryMapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function parseRegistryMapBounds(request: NextRequest): {
  bounds: RegistryMapBounds | null;
  hasInvalidBounds: boolean;
} {
  const northRaw = request.nextUrl.searchParams.get('north');
  const southRaw = request.nextUrl.searchParams.get('south');
  const eastRaw = request.nextUrl.searchParams.get('east');
  const westRaw = request.nextUrl.searchParams.get('west');
  const presentValues = [northRaw, southRaw, eastRaw, westRaw].filter(
    (value) => value !== null,
  );

  if (presentValues.length === 0) {
    return { bounds: null, hasInvalidBounds: false };
  }

  if (presentValues.length !== 4) {
    return { bounds: null, hasInvalidBounds: true };
  }

  const north = Number.parseFloat(northRaw ?? '');
  const south = Number.parseFloat(southRaw ?? '');
  const east = Number.parseFloat(eastRaw ?? '');
  const west = Number.parseFloat(westRaw ?? '');

  if (![north, south, east, west].every(Number.isFinite)) {
    return { bounds: null, hasInvalidBounds: true };
  }

  return {
    bounds: {
      north: Math.max(north, south), south: Math.min(north, south),
      east: Math.max(east, west), west: Math.min(east, west),
    },
    hasInvalidBounds: false,
  };
}
