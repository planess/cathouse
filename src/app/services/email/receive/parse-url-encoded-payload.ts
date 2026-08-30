import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import { getRemoteIp } from './get-remote-ip';
import { MailgunReceiveRouteError } from './mailgun-receive-route-error';

import type { NextRequest } from 'next/server';

export async function parseUrlEncodedPayload(
  request: NextRequest,
): Promise<IncomingMailgunEmailPayload> {
  const body = await request.text();

  if (body.trim().length === 0) {
    throw new MailgunReceiveRouteError(
      'Mailgun receive payload is empty.',
      400,
      'Invalid Mailgun payload.',
    );
  }

  const params = new URLSearchParams(body);

  return {
    fields: Object.fromEntries(params.entries()),
    attachments: [],
    remoteIp: getRemoteIp(request),
  };
}
