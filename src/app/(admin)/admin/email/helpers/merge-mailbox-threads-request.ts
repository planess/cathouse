import type { ApiResponse } from '../types/api-response';

type MergeMailboxThreadsResponse = {
  message: string;
  success: boolean;
};

/**
 * Requests that one mailbox thread be merged into another.
 *
 * @param mailboxId Mailbox that owns both threads.
 * @param sourceThreadId Thread whose messages should move.
 * @param targetThreadId Thread that should receive the messages.
 */
export async function mergeMailboxThreadsRequest(
  mailboxId: string,
  sourceThreadId: string,
  targetThreadId: string,
): Promise<ApiResponse<MergeMailboxThreadsResponse>> {
  const response = await fetch(
    `/api/admin/email/mailboxes/${mailboxId}/threads/merge`,
    {
      body: JSON.stringify({ sourceThreadId, targetThreadId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  );
  const payload = (await response.json()) as MergeMailboxThreadsResponse;

  return { ok: response.ok, payload };
}
