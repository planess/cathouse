import { getErrorMessage } from './get-error-message';
import { MailgunReceiveRouteError } from './mailgun-receive-route-error';
import { validationErrorStatuses } from './validation-error-statuses';

export function getRouteErrorResponse(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof MailgunReceiveRouteError) {
    return {
      message: error.publicMessage,
      status: error.status,
    };
  }

  const message = getErrorMessage(error);
  const status = validationErrorStatuses.get(message);

  if (status !== undefined) {
    return { message, status };
  }

  return {
    message: fallbackMessage,
    status: 500,
  };
}
