import type { EmailAddressSummary } from '@app/services/email.service';

type SearchEmailContactsResponse = {
  items?: EmailAddressSummary[];
};

/**
 * Searches saved email contacts for recipient autocomplete.
 *
 * @param query Name or email fragment entered by the user.
 * @param signal Signal used to cancel an obsolete request.
 */
export async function searchEmailContactsRequest(
  query: string,
  signal: AbortSignal,
): Promise<EmailAddressSummary[]> {
  const response = await fetch(
    `/api/admin/email/contacts?query=${encodeURIComponent(query)}`,
    { signal },
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as SearchEmailContactsResponse;

  return payload.items ?? [];
}
