import { type Document, type Filter } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

import { resolveAnimalImage } from '@app/(general)/registry/components/card/card.helpers';
import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type RawRegistryAnimalRecord = {
  id: string;
  detailsHref: string;
  mainAssetKey?: string;
  name: string;
  species: string;
  status: AnimalDocument['status'];
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  observedAt?: Date | string | null;
  isSterilized: boolean;
};

function parseBounds(request: NextRequest): {
  bounds: Bounds | null;
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
    return {
      bounds: null,
      hasInvalidBounds: false,
    };
  }

  if (presentValues.length !== 4) {
    return {
      bounds: null,
      hasInvalidBounds: true,
    };
  }

  const north = Number.parseFloat(northRaw ?? '');
  const south = Number.parseFloat(southRaw ?? '');
  const east = Number.parseFloat(eastRaw ?? '');
  const west = Number.parseFloat(westRaw ?? '');

  if (
    !Number.isFinite(north) ||
    !Number.isFinite(south) ||
    !Number.isFinite(east) ||
    !Number.isFinite(west)
  ) {
    return {
      bounds: null,
      hasInvalidBounds: true,
    };
  }

  return {
    bounds: {
      north: Math.max(north, south),
      south: Math.min(north, south),
      east: Math.max(east, west),
      west: Math.min(east, west),
    },
    hasInvalidBounds: false,
  };
}

export async function GET(request: NextRequest) {
  const { bounds, hasInvalidBounds } = parseBounds(request);
  const shouldLoadOnlyOwnDraft =
    request.nextUrl.searchParams.get('onlyOwnDraft') === 'true';

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

  let isModerator = false;
  let isVolunteer = false;

  if (userId !== null && userId !== undefined) {
    isModerator = await hasPermission(
      SYSTEM_PERMISSIONS.HISTORY_UPDATE_ANY,
      undefined,
      userId,
    );
    isVolunteer = await hasPermission(
      SYSTEM_PERMISSIONS.HISTORY_CREATE,
      undefined,
      userId,
    );
  }

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
        species: 1,
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
    observedAt:
      animal.observedAt instanceof Date
        ? animal.observedAt.toISOString()
        : typeof animal.observedAt === 'string'
          ? animal.observedAt
          : null,
  }));

  return NextResponse.json({ animals });
}
