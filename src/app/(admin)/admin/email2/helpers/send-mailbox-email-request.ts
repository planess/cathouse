import type { ApiResponse } from '../types/api-response';
import type { ComposeFormState } from '../types/compose-form-state';
import type { SendEmailResponse } from '../types/send-email-response';

export async function sendMailboxEmailRequest(
  mailboxId: string,
  form: ComposeFormState,
): Promise<ApiResponse<SendEmailResponse>> {
  const response = await fetch('/api/admin/email/threads', {
    body: JSON.stringify({
      mailboxId,
      ...form,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const payload = (await response.json()) as SendEmailResponse;

  return {
    ok: response.ok,
    payload,
  };
}
