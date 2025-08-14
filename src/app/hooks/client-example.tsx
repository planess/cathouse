'use client';

import { useUser } from './use-user';

export function ClientAuthExample() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (user === null) {
    return <div>Please sign in to continue</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role ?? 'User'}</p>
    </div>
  );
}
