import { redirect } from 'next/navigation';

import { getUser } from '@app/hooks/get-user';

/**
 * Restricts a page to visitors with a valid session.
 * Anonymous visitors are redirected away.
 *
 * @param redirectTo - Path to send anonymous visitors to.
 */
export async function requireUser(redirectTo = '/signin'): Promise<void> {
  const user = await getUser();

  if (!user) {
    redirect(redirectTo);
  }
}
