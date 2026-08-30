import type { NextRequest } from 'next/server';

export function getContentType(request: NextRequest) {
  return request.headers.get('content-type') ?? '';
}
