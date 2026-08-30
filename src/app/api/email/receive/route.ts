import { createJsonResponse } from '@app/helpers/create-json-response';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { assertPayloadHasMailgunFields } from '@app/services/email/receive/assert-payload-has-mailgun-fields';
import { getPayloadLogMetadata } from '@app/services/email/receive/get-payload-log-metadata';
import { getRouteErrorResponse } from '@app/services/email/receive/get-route-error-response';
import { parseIncomingPayload } from '@app/services/email/receive/parse-incoming-payload';
import { emailService } from '@app/services/email.service';
import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let payload: IncomingMailgunEmailPayload;

  try {
    payload = await parseIncomingPayload(request);
    assertPayloadHasMailgunFields(payload);
  } catch (error) {
    await logDevelopmentError(
      'email.receive.route.parseIncomingPayload',
      error,
      getPayloadLogMetadata(request),
    );

    const response = getRouteErrorResponse(error, 'Invalid Mailgun payload.');

    return createJsonResponse(
      { success: false, message: response.message },
      response.status,
    );
  }

  try {
    const result = await emailService.processIncomingMailgunEmail(payload);

    return createJsonResponse({
      success: true,
      message: result.duplicate
        ? 'Message already received.'
        : 'Message received.',
      result,
    });
  } catch (error) {
    await logDevelopmentError(
      'email.receive.route.processIncomingMailgunEmail',
      error,
      getPayloadLogMetadata(request, payload),
    );

    const response = getRouteErrorResponse(error, 'Failed to receive email.');

    return createJsonResponse(
      { success: false, message: response.message },
      response.status,
    );
  }
}
