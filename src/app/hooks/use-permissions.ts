'use client';

import { useMemo } from 'react';

import { useUserLoading, useCurrentUser } from './use-user';

interface CurrentUserPermission {
  access: boolean;
  isLoading: boolean;
}

export function usePermission(permission: string, context?: string): CurrentUserPermission {
  const user = useCurrentUser();
  const isLoading = useUserLoading();

  const access = useMemo(
    () => process.env.NODE_ENV === 'development' || (user?.scopes ?? []).includes(permission),
    [user?.scopes, permission],
  );

  return { access, isLoading };
}
