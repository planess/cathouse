'use client';

import { useContext } from 'react';

import { User } from '@app/models/user';
import { UserContext } from '@app/providers/user';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

// Convenience hooks for client components
export function useIsAuthenticated(): boolean {
  const { user } = useUser();

  return user !== null;
}

export function useCurrentUser(): User | null {
  const { user } = useUser();

  return user;
}

export function useUserLoading(): boolean {
  const { isLoading } = useUser();

  return isLoading;
}

export function useUserRefreshing(): boolean {
  const { isRefreshing } = useUser();

  return isRefreshing;
}
