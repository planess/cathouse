import type { EmailMessageSummary } from '@app/services/email.service';

import type { ApiResponse } from '../types/api-response';
import type { SendEmailResponse } from '../types/send-email-response';
import type { ThreadReplyFormState } from '../types/thread-reply-form-state';

type SendThreadReplyResponse = SendEmailResponse & {
  messageItem?: EmailMessageSummary;
};

export async function sendThreadReplyRequest(
  threadId: string,
  mailboxId: string,
  form: ThreadReplyFormState,
  attachments: File[],
): Promise<ApiResponse<SendThreadReplyResponse>> {
  const formData = new FormData();

  formData.append('mailboxId', mailboxId);
  formData.append('to', JSON.stringify(form.to));
  formData.append('cc', JSON.stringify(form.cc));
  formData.append('bcc', JSON.stringify(form.bcc));
  formData.append('bodyHtml', form.bodyHtml);

  for (const attachment of attachments) {
    formData.append('attachments', attachment);
  }

  const response = await fetch(
    `/api/admin/email/threads/${threadId}/messages`,
    {
      body: formData,
      method: 'POST',
    },
  );
  const payload = (await response.json()) as SendThreadReplyResponse;

  return {
    ok: response.ok,
    payload,
  };
}
