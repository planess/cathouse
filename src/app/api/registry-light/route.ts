import { NextRequest, NextResponse } from 'next/server';

import { parseRegistryStatusFilter } from '@app/(general)/registry/helpers/registry-status-filter';
import { REGISTRY_LIGHT_ANIMALS_BATCH_SIZE } from '@app/(general)/registry-light/registry-light.constants';
import { listRegistryLightAnimalsPage } from '@app/(general)/registry-light/server/list-registry-light-animals';

function parseQueryInteger(value: string | null, fallback: number) {
  if (value === null) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

export async function GET(request: NextRequest) {
  const offset = parseQueryInteger(
    request.nextUrl.searchParams.get('offset'),
    0,
  );
  const limit = parseQueryInteger(
    request.nextUrl.searchParams.get('limit'),
    REGISTRY_LIGHT_ANIMALS_BATCH_SIZE,
  );
  const statusFilter = parseRegistryStatusFilter(
    request.nextUrl.searchParams.get('status'),
  );

  if (offset === null || limit === null || limit === 0) {
    return NextResponse.json(
      {
        error: 'Invalid pagination query.',
      },
      { status: 400 },
    );
  }

  const page = await listRegistryLightAnimalsPage({
    offset,
    limit,
    statusFilter,
  });

  return NextResponse.json(page);
}
