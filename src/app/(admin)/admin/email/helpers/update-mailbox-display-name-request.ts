import type { EmailMailboxSummary } from '@app/services/email.service';

type UpdateMailboxDisplayNameResponse = {
  success: boolean;
  message: string;
  mailbox?: EmailMailboxSummary;
};

export async function updateMailboxDisplayNameRequest(
  mailboxId: string,
  displayName: string,
): Promise<{ ok: boolean; payload: UpdateMailboxDisplayNameResponse }> {
  const response = await fetch(`/api/admin/email/mailboxes/${mailboxId}`, {
    body: JSON.stringify({ displayName }),
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
  });
  const payload = (await response.json()) as UpdateMailboxDisplayNameResponse;

  return { ok: response.ok, payload };
}
