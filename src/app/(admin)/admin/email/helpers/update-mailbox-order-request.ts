import type { ApiResponse } from '../types/api-response';

type UpdateMailboxOrderResponse = {
  message: string;
  success: boolean;
};

/**
 * Persists mailbox identifiers in their desired display order.
 *
 * @param mailboxIds Mailbox identifiers in display order.
 */
export async function updateMailboxOrderRequest(
  mailboxIds: string[],
): Promise<ApiResponse<UpdateMailboxOrderResponse>> {
  const response = await fetch('/api/admin/email/mailboxes', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mailboxIds }),
  });
  const payload = (await response.json()) as UpdateMailboxOrderResponse;

  return { ok: response.ok, payload };
}
