export async function markThreadMessagesReadRequest(
  threadId: string,
): Promise<boolean> {
  const response = await fetch(`/api/admin/email/threads/${threadId}/read`, {
    method: 'POST',
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { success?: boolean };

  return payload.success === true;
}
