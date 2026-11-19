/**
 * Marks messages as read by the current user in one request.
 *
 * @param messageIds - Ids of the messages the user has seen.
 * @returns Ids of the messages whose read state was saved, or `null` when the
 * request failed.
 */
export async function markMessagesReadRequest(
  messageIds: string[],
): Promise<string[] | null> {
  const response = await fetch('/api/admin/email/messages/read', {
    body: JSON.stringify({ messageIds }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    markedMessageIds?: string[];
    success?: boolean;
  };

  return payload.success === true ? (payload.markedMessageIds ?? []) : null;
}
