import type { EmailMessageSummary } from '@app/services/email.service';

import type { ApiResponse } from '../types/api-response';
import type { SendEmailResponse } from '../types/send-email-response';

type ForwardMessageResponse = SendEmailResponse & {
  messageItem?: EmailMessageSummary;
};

export async function sendForwardMessageRequest(
  messageId: string,
  mailboxId: string,
  recipient: string,
): Promise<ApiResponse<ForwardMessageResponse>> {
  const response = await fetch(
    `/api/admin/email/messages/${messageId}/forward`,
    {
      body: JSON.stringify({ mailboxId, recipient }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  );
  const payload = (await response.json()) as ForwardMessageResponse;

  return { ok: response.ok, payload };
}
