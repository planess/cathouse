import type { ApiResponse } from '../types/api-response';
import type { CreateMailboxResponse } from '../types/create-mailbox-response';

export async function createMailboxRequest(
  prefix: string,
  displayName: string,
): Promise<ApiResponse<CreateMailboxResponse>> {
  const response = await fetch('/api/admin/email/mailboxes', {
    body: JSON.stringify({
      displayName: displayName.trim(),
      prefix,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const payload = (await response.json()) as CreateMailboxResponse;

  return {
    ok: response.ok,
    payload,
  };
}
