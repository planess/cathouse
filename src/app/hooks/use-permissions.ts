'use client';

import { useMemo } from 'react';

import { SystemPermission } from '@app/models/system-permissions';

import { useUserLoading, useCurrentUser } from './use-user';

interface CurrentUserPermission {
  access: boolean;
  isLoading: boolean;
}

export function usePermission(permission: SystemPermission, context?: string): CurrentUserPermission {
  const user = useCurrentUser();
  const isLoading = useUserLoading();

  const access = useMemo(
    () => (user?.scopes ?? []).includes(permission),
    [user?.scopes, permission],
  );

  return { access, isLoading };
}
