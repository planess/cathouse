
import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import { getContentType } from './get-content-type';

import type { NextRequest } from 'next/server';

export function getPayloadLogMetadata(
  request: NextRequest,
  payload?: IncomingMailgunEmailPayload,
) {
  return {
    attachmentCount: payload?.attachments.length,
    contentType: getContentType(request),
    fieldNames:
      payload === undefined ? undefined : Object.keys(payload.fields).join(','),
    from: payload?.fields.from,
    recipient: payload?.fields.recipient,
    route: '/api/email/receive',
    subject: payload?.fields.subject,
  };
}
