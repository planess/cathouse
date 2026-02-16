'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cookieAgreement';
const WINDOW_EVENT = 'cookie-agreement-change';

type CookieAgreementStatus = 'unknown' | 'accepted' | 'rejected';

type CookieAgreementState = {
  status: CookieAgreementStatus;
  acceptedAt: string | null;
  value: string | false | null;
};

function parseAgreement(value: string | null): CookieAgreementState {
  if (value === null) {
    return { status: 'unknown', acceptedAt: null, value: null };
  }

  if (value === 'false') {
    return { status: 'rejected', acceptedAt: null, value: false };
  }

  const date = Date.parse(value);
  if (Number.isNaN(date)) {
    return { status: 'unknown', acceptedAt: null, value: null };
  }

  return {
    status: 'accepted',
    acceptedAt: new Date(date).toISOString(),
    value,
  };
}

export function useCookieAgreement() {
  const [initialized, setInitialized] = useState(false);
  const [state, setState] = useState<CookieAgreementState>(() =>
    parseAgreement(null),
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncFromStorage = () => {
      const data = window.localStorage.getItem(STORAGE_KEY);
      const cookieAgreement = parseAgreement(data);

      if (data && cookieAgreement.status === 'unknown') {
        // Clean up invalid value
        window.localStorage.removeItem(STORAGE_KEY);
      }

      setState(cookieAgreement);
      setInitialized(true);
    };

    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      syncFromStorage();
    };

    const handleAgreementChange = () => syncFromStorage();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(WINDOW_EVENT, handleAgreementChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(WINDOW_EVENT, handleAgreementChange);
    };
  }, []);

  const setAgree = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const now = new Date().toISOString();

    window.localStorage.setItem(STORAGE_KEY, now);
    window.dispatchEvent(new Event(WINDOW_EVENT));

    setState(parseAgreement(now));
  }, []);

  const setReject = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, 'false');
    window.dispatchEvent(new Event(WINDOW_EVENT));

    setState(parseAgreement('false'));
  }, []);

  const agreement = useMemo(
    () => ({
      ...state,
      isAccepted: state.status === 'accepted' && initialized,
      isRejected: state.status === 'rejected' && initialized,
      isUnknown: state.status === 'unknown' && initialized,
      setAgree,
      setReject,
    }),
    [state, setAgree, setReject, initialized],
  );
  return agreement;
}
