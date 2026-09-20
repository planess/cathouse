import type { EmailThreadSummary } from '@app/services/email.service';

type SearchMailboxThreadsResponse = {
  items?: EmailThreadSummary[];
};

/**
 * Searches threads belonging to one mailbox.
 *
 * @param mailboxId Mailbox whose threads should be searched.
 * @param query Text matched against thread and message data.
 * @param signal Signal used to cancel an obsolete request.
 */
export async function searchMailboxThreadsRequest(
  mailboxId: string,
  query: string,
  signal: AbortSignal,
): Promise<EmailThreadSummary[]> {
  const search = new URLSearchParams({
    page: '1',
    pageSize: '10',
    query,
  });
  const response = await fetch(
    `/api/admin/email/mailboxes/${mailboxId}/threads?${search.toString()}`,
    { signal },
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as SearchMailboxThreadsResponse;

  return payload.items ?? [];
}
