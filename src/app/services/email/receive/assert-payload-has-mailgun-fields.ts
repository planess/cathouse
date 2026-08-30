import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import { MailgunReceiveRouteError } from './mailgun-receive-route-error';

export function assertPayloadHasMailgunFields(
  payload: IncomingMailgunEmailPayload,
) {
  if (Object.keys(payload.fields).length === 0) {
    throw new MailgunReceiveRouteError(
      'Mailgun receive payload does not contain fields.',
      400,
      'Invalid Mailgun payload.',
    );
  }
}
