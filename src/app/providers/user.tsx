'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { onRefresh } from '@app/hooks/authorization-event-target';
import { User } from '@app/models/user';

interface UserContextType {
  user: User | null;
  isLoading: boolean; // the first load of user
  isRefreshing: boolean; // a refresh is in progress
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  isRefreshing: false,
});

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch('/api/profile');

      if (!response.ok) {
        if (response.status === 401) {
          setUserState(null);

          return;
        }

        throw new Error('Unauthorized');
      }

      const data = (await response.json()) as { user: User };
      const user = data.user;

      setUserState(user);
    } catch {
      //   console.error('Error fetching user profile:', error);
      setUserState(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    return onRefresh(() => void refresh());
  }, [refresh]);

  const value = useMemo<UserContextType>(
    () => ({
      user,
      isLoading,
      isRefreshing,
    }),
    [user, isLoading, isRefreshing],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
