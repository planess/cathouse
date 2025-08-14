'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

// Client-side hook implementation
export function useUser(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated (implement your logic here)
        const token = localStorage.getItem('authToken');

        if (token !== null) {
          // TODO: Validate token with your backend
          // const user = await validateToken(token);
          // setAuthState({ user, isLoading: false });

          // For now, just set loading to false
          setAuthState({
            user: null,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
          });
        }
      } catch {
        setAuthState({
          user: null,
          isLoading: false,
        });
      }
    };

    void checkAuth();
  }, []);

  return authState;
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

export function useAuthLoading(): boolean {
  const { isLoading } = useUser();

  return isLoading;
}
