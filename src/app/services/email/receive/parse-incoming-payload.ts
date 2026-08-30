import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import { getContentType } from './get-content-type';
import { parseFormPayload } from './parse-form-payload';
import { parseJsonPayload } from './parse-json-payload';
import { parseUrlEncodedPayload } from './parse-url-encoded-payload';

import type { NextRequest } from 'next/server';

export async function parseIncomingPayload(
  request: NextRequest,
): Promise<IncomingMailgunEmailPayload> {
  const contentType = getContentType(request);

  if (contentType.includes('application/json')) {
    return parseJsonPayload(request);
  }

  if (contentType.includes('multipart/form-data')) {
    return parseFormPayload(request);
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return parseUrlEncodedPayload(request);
  }

  return parseUrlEncodedPayload(request);
}
