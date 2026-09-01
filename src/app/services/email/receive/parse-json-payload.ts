import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import { getRemoteIp } from './get-remote-ip';
import { isIncomingAttachment } from './is-incoming-attachment';
import { MailgunReceiveRouteError } from './mailgun-receive-route-error';
import { stringifyFieldValue } from './stringify-field-value';

import type { NextRequest } from 'next/server';

export async function parseJsonPayload(
  request: NextRequest,
): Promise<IncomingMailgunEmailPayload> {
  const body: unknown = await request.json();

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new MailgunReceiveRouteError(
      'Mailgun JSON payload must be an object.',
      400,
      'Invalid Mailgun payload.',
    );
  }

  const bodyRecord = body as Record<string, unknown>;
  const { attachments: rawAttachments, ...rawFields } = bodyRecord;
  const fields = Object.fromEntries(
    Object.entries(rawFields).map(([key, value]) => [
      key,
      stringifyFieldValue(value),
    ]),
  );
  const attachments = Array.isArray(rawAttachments)
    ? rawAttachments
      .map((attachment, index) => {
        if (typeof attachment !== 'object' || attachment === null) {
          return null;
        }

        const record = attachment as Record<string, unknown>;
        const fileName = stringifyFieldValue(
          record.filename ?? record.name ?? `attachment-${index + 1}`,
        );
        const contentType = stringifyFieldValue(
          record['content-type'] ??
              record.contentType ??
              'application/octet-stream',
        );
        const sizeBytes = Number(record.size ?? record.sizeBytes ?? 0);

        return {
          fileName,
          contentType,
          sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : 0,
          fieldName: `attachment-${index + 1}`,
        };
      })
      .filter(isIncomingAttachment)
    : [];

  return {
    fields,
    attachments,
    remoteIp: getRemoteIp(request),
  };
}
