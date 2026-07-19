
import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import { getRemoteIp } from './get-remote-ip';
import { isIncomingAttachment } from './is-incoming-attachment';

import type { NextRequest } from 'next/server';

export async function parseFormPayload(
  request: NextRequest,
): Promise<IncomingMailgunEmailPayload> {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  const attachments = [...formData.entries()]
    .map(([key, value]) => {
      if (value instanceof File) {
        return {
          fileName: value.name || key,
          contentType: value.type || 'application/octet-stream',
          sizeBytes: value.size,
          fieldName: key,
        };
      }

      fields[key] = value.toString();

      return null;
    })
    .filter(isIncomingAttachment);

  return {
    fields,
    attachments,
    remoteIp: getRemoteIp(request),
  };
}
