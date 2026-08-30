import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import { getRemoteIp } from './get-remote-ip';

import type { NextRequest } from 'next/server';

export async function parseFormPayload(
  request: NextRequest,
): Promise<IncomingMailgunEmailPayload> {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  const attachments = [...formData.entries()].reduce<
    IncomingMailgunEmailPayload['attachments']
  >((items, [key, value]) => {
    if (value instanceof File) {
      items.push({
        fileName: value.name || key,
        contentType: value.type || 'application/octet-stream',
        sizeBytes: value.size,
        fieldName: key,
        file: value,
      });

      return items;
    }

    fields[key] = value.toString();

    return items;
  }, []);

  return {
    fields,
    attachments,
    remoteIp: getRemoteIp(request),
  };
}
