import { type Document, type Filter } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

import { resolveAnimalImage } from '@app/(general)/registry/components/card/card.helpers';
import { parseRegistryMapBounds } from '@app/(general)/registry/server/parse-registry-map-bounds';
import { parseRegistryStatusFilter } from '@app/(general)/registry/server/parse-registry-status-filter';
import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import { AnimalStatus, type AnimalDocument } from '@app/models/animal';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

type RawRegistryAnimalRecord = {
  id: string;
  detailsHref: string;
  mainAssetKey?: string;
  name: string;
  sex: AnimalDocument['sex'];
  birthday?: Date | string | null;
  status: AnimalDocument['status'];
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  observedAt?: Date | string | null;
  isSterilized: boolean;
};

const REGISTRY_STATUS_FILTERS = {
  adoption: [AnimalStatus.underTreatment, AnimalStatus.sheltered],
} as const;

export async function GET(request: NextRequest) {
  const { bounds, hasInvalidBounds } = parseRegistryMapBounds(request);
  const shouldLoadOnlyOwnDraft =
    request.nextUrl.searchParams.get('onlyOwnDraft') === 'true';
  const statusFilter = parseRegistryStatusFilter(
    request.nextUrl.searchParams.get('status'),
  );

  if (hasInvalidBounds) {
    return NextResponse.json(
      {
        animals: [],
        error: 'Invalid bounds query.',
      },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  const userId = user?.id;

  if (userId === null || userId === undefined) {
    return NextResponse.json(
      {
        animals: [],
        error: 'Unauthorized',
      },
      { status: 401 },
    );
  }

  const canReadRegistryMap = await hasPermission(
    SYSTEM_PERMISSIONS.REGISTRY_MAP_READ,
    undefined,
    userId,
  );

  if (!canReadRegistryMap) {
    return NextResponse.json(
      {
        animals: [],
        error: 'Forbidden',
      },
      { status: 403 },
    );
  }

  const isModerator = await hasPermission(
    SYSTEM_PERMISSIONS.HISTORY_UPDATE_ANY,
    undefined,
    userId,
  );
  const isVolunteer = await hasPermission(
    SYSTEM_PERMISSIONS.HISTORY_CREATE,
    undefined,
    userId,
  );

  const findCondition: Filter<AnimalDocument> = {};
  const shouldLoadVolunteerOwnDraft =
    shouldLoadOnlyOwnDraft &&
    isVolunteer &&
    userId !== null &&
    userId !== undefined;

  if (shouldLoadVolunteerOwnDraft) {
    Object.assign(findCondition, {
      draft: true,
      createdBy: { $eq: userId },
    });
  } else if (isModerator) {
    // moderators can access all documents, including drafts
  } else if (isVolunteer && userId !== null && userId !== undefined) {
    Object.assign(findCondition, {
      $or: [{ draft: { $ne: true } }, { createdBy: { $eq: userId } }],
    });
  } else {
    Object.assign(findCondition, { draft: { $ne: true } });
  }

  if (statusFilter !== null) {
    Object.assign(findCondition, {
      status: {
        $in: REGISTRY_STATUS_FILTERS[statusFilter],
      },
    });
  }

  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);

  const pipeline: Document[] = [
    {
      $match: findCondition,
    },
    {
      $addFields: {
        lastObservation: {
          $arrayElemAt: ['$observations', -1],
        },
      },
    },
    {
      $project: {
        id: { $toString: '$_id' },
        detailsHref: {
          $concat: ['/registry/', { $toString: '$_id' }],
        },
        mainAssetKey: '$mainAsset.key',
        name: 1,
        sex: 1,
        birthday: 1,
        status: 1,
        address: '$lastObservation.location.address',
        latitude: '$lastObservation.location.coordinates.latitude',
        longitude: '$lastObservation.location.coordinates.longitude',
        observedAt: '$lastObservation.date',
        isSterilized: {
          $ne: ['$vetMarkers.sterilized', null],
        },
      },
    },
  ];

  if (!shouldLoadVolunteerOwnDraft) {
    pipeline.push({
      $match: {
        latitude: { $type: 'number' },
        longitude: { $type: 'number' },
      },
    });
  }

  if (bounds !== null && !shouldLoadVolunteerOwnDraft) {
    pipeline.push({
      $match: {
        latitude: { $gte: bounds.south, $lte: bounds.north },
        longitude: { $gte: bounds.west, $lte: bounds.east },
      },
    });
  }

  pipeline.push(
    {
      $sort: {
        observedAt: -1,
      },
    },
    {
      $limit: 500,
    },
  );

  const rawAnimals = await animalsCollection
    .aggregate<RawRegistryAnimalRecord>(pipeline)
    .toArray();

  const animals = rawAnimals.map(({ mainAssetKey, ...animal }) => ({
    ...animal,
    previewImage: resolveAnimalImage(
      mainAssetKey,
      process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL,
    ),
    address: animal.address ?? '',
    latitude: typeof animal.latitude === 'number' ? animal.latitude : null,
    longitude: typeof animal.longitude === 'number' ? animal.longitude : null,
    birthday:
      animal.birthday instanceof Date
        ? animal.birthday.toISOString()
        : typeof animal.birthday === 'string'
          ? animal.birthday
          : null,
    observedAt:
      animal.observedAt instanceof Date
        ? animal.observedAt.toISOString()
        : typeof animal.observedAt === 'string'
          ? animal.observedAt
          : null,
  }));

  return NextResponse.json({ animals });
}
