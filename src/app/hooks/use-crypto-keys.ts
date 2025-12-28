'use client';

import { useCallback, useEffect, useState } from 'react';

import { loadKeysFromDB } from '@app/helpers/load-keys-from-db';
import { pemToCryptoKey } from '@app/helpers/pem-to-crypto-key';

interface CryptoKeysState {
  publicKey: string | null;
  cryptoKey: CryptoKey | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing asymmetric crypto keys
 * Returns the public key, requesting server to create new key pair if none exists
 */
export function useCryptoKeys(): CryptoKeysState {
  const [state, setState] = useState<CryptoKeysState>({
    publicKey: null,
    cryptoKey: null,
    isLoading: true,
    error: null,
  });

  const loadKeys = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Try to load existing keys from database
      const { key } = await loadKeysFromDB();

      if (key === null) {
        throw new Error('Failed to load or create crypto keys');
      }

      // Convert PEM to CryptoKey
      const cryptoKey = await pemToCryptoKey(key);

      setState({
        publicKey: key,
        cryptoKey,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        publicKey: null,
        cryptoKey: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load or create crypto keys',
      });
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  return state;
}

// Convenience hook for just getting the public key
export function usePublicKey(): string | null {
  const { publicKey } = useCryptoKeys();

  return publicKey;
}

// Convenience hook for getting the CryptoKey object
export function useCryptoKey(): CryptoKey | null {
  const { cryptoKey } = useCryptoKeys();

  return cryptoKey;
}

// Hook for checking if keys are loading
export function useCryptoKeysLoading(): boolean {
  const { isLoading } = useCryptoKeys();

  return isLoading;
}

// Hook for getting any errors
export function useCryptoKeysError(): string | null {
  const { error } = useCryptoKeys();

  return error;
}
