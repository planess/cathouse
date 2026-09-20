import type { EmailMessageSummary } from '@app/services/email.service';

type ThreadMessagesResponse = {
  message?: string;
  messages?: EmailMessageSummary[];
};

/**
 * Loads the latest messages for an open email conversation.
 *
 * @param threadId Identifier of the thread to refresh.
 * @param signal Signal used to cancel an obsolete refresh request.
 * @returns Messages currently stored for the thread.
 */
export async function loadThreadMessagesRequest(
  threadId: string,
  signal?: AbortSignal,
): Promise<EmailMessageSummary[]> {
  const response = await fetch(`/api/admin/email/threads/${threadId}/messages`, {
    cache: 'no-store',
    signal,
  });
  const payload = (await response.json()) as ThreadMessagesResponse;

  if (!response.ok) {
    throw new Error(payload.message ?? 'Failed to load messages.');
  }

  return payload.messages ?? [];
}
