import { type Filter } from 'mongodb';

import { resolveAnimalImage } from '@app/(general)/registry/components/card/card.helpers';
import {
  RegistryStatusFilter,
  registryStatusFilters,
} from '@app/(general)/registry/helpers/registry-status-filter';
import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument, AnimalObservation } from '@app/models/animal';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import { REGISTRY_LIGHT_ANIMALS_BATCH_SIZE } from '../registry-light.constants';

import type {
  RegistryLightAnimalRecord,
  RegistryLightAnimalsPage,
} from '../types/registry-light.types';

function getLatestObservationDate(
  observations?: AnimalObservation[],
): Date | null {
  if (observations === undefined || observations.length === 0) {
    return null;
  }

  const latestObservation = [...observations].sort(
    (left, right) => (right.date?.getTime() ?? 0) - (left.date?.getTime() ?? 0),
  )[0];

  return latestObservation?.date ?? null;
}

export async function listRegistryLightAnimals(
  options: {
    statusFilter?: RegistryStatusFilter | null;
  } = {},
): Promise<RegistryLightAnimalRecord[]> {
  const user = await getCurrentUser();
  const userId = user?.id;

  const [isModerator, isVolunteer] =
    userId !== null && userId !== undefined
      ? await Promise.all([
          hasPermission(
            SYSTEM_PERMISSIONS.HISTORY_UPDATE_ANY,
            undefined,
            userId,
          ),
          hasPermission(SYSTEM_PERMISSIONS.HISTORY_CREATE, undefined, userId),
        ])
      : [false, false];

  const conditions: Filter<AnimalDocument>[] = [];
  const visibilityCondition: Filter<AnimalDocument> = {};

  if (isModerator) {
    // moderators can access all documents, including drafts
  } else if (isVolunteer && userId !== null && userId !== undefined) {
    Object.assign(visibilityCondition, {
      $or: [{ draft: { $ne: true } }, { createdBy: { $eq: userId } }],
    });
  } else {
    Object.assign(visibilityCondition, { draft: { $ne: true } });
  }

  if (Object.keys(visibilityCondition).length > 0) {
    conditions.push(visibilityCondition);
  }

  if (options.statusFilter !== null && options.statusFilter !== undefined) {
    conditions.push({
      status: {
        $in: registryStatusFilters[options.statusFilter],
      },
    });
  }

  const findCondition: Filter<AnimalDocument> =
    conditions.length === 0
      ? {}
      : conditions.length === 1
        ? conditions[0]
        : { $and: conditions };

  const client = await clientPromise;
  const db = client.db();
  const animals = await db
    .collection<AnimalDocument>(DbTables.animals)
    .find(findCondition)
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  const records = animals.map<RegistryLightAnimalRecord>((animal) => {
    const lastSeenAt = getLatestObservationDate(animal.observations);

    return {
      id: animal._id?.toString() ?? '',
      name: animal.name?.trim() ?? '',
      description: animal.description?.trim() ?? null,
      species: animal.species,
      status: animal.status,
      previewImage: resolveAnimalImage(
        animal.mainAsset?.key,
        process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL,
      ),
      lastSeenAt: lastSeenAt?.toISOString() ?? null,
      isSterilized: animal.vetMarkers?.sterilized !== undefined,
      isVaccinated:
        (animal.vetMarkers?.rabiesVaccination?.length ?? 0) > 0 ||
        (animal.vetMarkers?.virusVaccination?.length ?? 0) > 0,
      age: animal.birthday
        ? Math.floor(
            (Date.now() - animal.birthday.getTime()) /
              (1000 * 60 * 60 * 24 * 365),
          )
        : null,
    };
  });

  records.sort((left, right) => {
    const leftTime = left.lastSeenAt !== null ? Date.parse(left.lastSeenAt) : 0;
    const rightTime =
      right.lastSeenAt !== null ? Date.parse(right.lastSeenAt) : 0;

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return left.name.localeCompare(right.name);
  });

  return records;
}

type ListRegistryLightAnimalsPageOptions = {
  limit?: number;
  offset?: number;
  statusFilter?: RegistryStatusFilter | null;
};

export async function listRegistryLightAnimalsPage(
  options: ListRegistryLightAnimalsPageOptions = {},
): Promise<RegistryLightAnimalsPage> {
  const limit = Math.max(
    1,
    Math.min(options.limit ?? REGISTRY_LIGHT_ANIMALS_BATCH_SIZE, 100),
  );
  const offset = Math.max(0, options.offset ?? 0);
  const animals = await listRegistryLightAnimals({
    statusFilter: options.statusFilter,
  });
  const paginatedAnimals = animals.slice(offset, offset + limit);

  return {
    animals: paginatedAnimals,
    hasMore: offset + paginatedAnimals.length < animals.length,
    total: animals.length,
  };
}
