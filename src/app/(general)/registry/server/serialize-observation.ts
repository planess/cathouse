import { ObjectId } from 'mongodb';

import type { AnimalObservation } from '@app/models/animal';
import type { MediaAsset } from '@app/models/media-asset';

type SerializedMediaAsset = Omit<MediaAsset, 'uploadedAt'> & {
  uploadedAt: string;
};

export type SerializedObservation = {
  date: string;
  note?: string;
  location?: {
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  assets?: SerializedMediaAsset[];
  informator?: string;
  health?: number;
  createdBy: string;
  createdAt: string;
};

export function serializeObservation(
  observation: AnimalObservation,
  userId: ObjectId,
): SerializedObservation {
  return {
    date: observation.date?.toISOString() ?? new Date().toISOString(),
    note: observation.note ?? undefined,
    location: observation.location
      ? {
          address: observation.location.address,
          coordinates: {
            latitude: observation.location.coordinates.latitude,
            longitude: observation.location.coordinates.longitude,
          },
        }
      : undefined,
    assets: observation.assets?.map((asset) => ({
      ...asset,
      uploadedAt: asset.uploadedAt?.toISOString() ?? new Date().toISOString(),
    })),
    informator: observation.informator?.toHexString(),
    health: observation.health,
    createdBy: (observation.createdBy ?? userId).toHexString(),
    createdAt: observation.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}
