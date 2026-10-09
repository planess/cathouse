import { redirect } from 'next/navigation';

import { getUser } from '@app/hooks/get-user';

/**
 * Restricts a page to visitors without a valid session.
 * Authenticated users are redirected away.
 *
 * @param redirectTo - Path to send authenticated users to.
 */
export async function requireGuest(redirectTo = '/'): Promise<void> {
  const user = await getUser();

  if (user) {
    redirect(redirectTo);
  }
}
