'use client';

import { useState, useEffect, useCallback } from 'react';

import { loadKeysFromDB } from '@app/helpers/load-keys-from-db';
import { pemToCryptoKey } from '@app/helpers/pem-to-crypto-key';

export interface CryptoKeyPair {
  id: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  algorithm: string;
}

export interface CryptoKeysState {
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

  const requestKeyGeneration = useCallback(async (): Promise<CryptoKeyPair> => {
    try {
      const response = await fetch('/api/crypto-keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate key pair: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(
        `Failed to generate key pair: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }, []);

  const loadOrCreateKeys = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Try to load existing keys from database
      const existingKeys = await loadKeysFromDB();

      if (existingKeys?.length > 0) {
        // Use the most recent key pair
        const latestKey = existingKeys.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

        // Convert PEM to CryptoKey
        const cryptoKey = await pemToCryptoKey(latestKey.publicKey);

        setState({
          publicKey: latestKey.publicKey,
          cryptoKey,
          isLoading: false,
          error: null,
        });
      } else {
        // Request server to generate new key pair if none exists
        const newKeyPair = await requestKeyGeneration();

        // Convert PEM to CryptoKey
        const cryptoKey = await pemToCryptoKey(newKeyPair.publicKey);

        setState({
          publicKey: newKeyPair.publicKey,
          cryptoKey,
          isLoading: false,
          error: null,
        });
      }
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
  }, [requestKeyGeneration]);

  useEffect(() => {
    void loadOrCreateKeys();
  }, [loadOrCreateKeys]);

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
