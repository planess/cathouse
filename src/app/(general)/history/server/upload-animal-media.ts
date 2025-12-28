import type { ObjectId } from 'mongodb';

import { MediaAsset } from '@app/models/media-asset';
import { r2Service } from '@app/services/r2.service';

export function uploadAnimalMedia(
  files: File[],
  animalId: ObjectId,
  userId: ObjectId,
): Promise<MediaAsset[]> {
  return r2Service.uploadFiles(files, {
    folder: `animals/${animalId.toHexString()}`,
    metadata: {
      uploadedBy: userId.toHexString(),
      animalId: animalId.toHexString(),
    },
  });
}
