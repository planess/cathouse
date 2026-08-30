import type { ApiResponse } from '../types/api-response';
import type { ComposeFormState } from '../types/compose-form-state';
import type { SendEmailResponse } from '../types/send-email-response';

export async function sendMailboxEmailRequest(
  mailboxId: string,
  form: ComposeFormState,
  attachments: File[],
): Promise<ApiResponse<SendEmailResponse>> {
  const formData = new FormData();

  formData.append('mailboxId', mailboxId);
  formData.append('to', JSON.stringify(form.to));
  formData.append('cc', JSON.stringify(form.cc));
  formData.append('bcc', JSON.stringify(form.bcc));
  formData.append('subject', form.subject);
  formData.append('bodyHtml', form.bodyHtml);

  for (const attachment of attachments) {
    formData.append('attachments', attachment);
  }

  const response = await fetch('/api/admin/email/threads', {
    body: formData,
    method: 'POST',
  });
  const payload = (await response.json()) as SendEmailResponse;

  return {
    ok: response.ok,
    payload,
  };
}
