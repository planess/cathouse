import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@app/hooks/get-current-user';

import SessionsSection from '../components/sessions-section/sessions-section';
import { getUserSessions } from '../services/get-user-sessions';

export default async function ProfileSessionsPage() {
  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);

  if (!user) {
    redirect('/signin');
  }

  const sessions = await getUserSessions(
    user.id,
    cookieStore.get('token')?.value,
  );

  return <SessionsSection sessions={sessions} />;
}
