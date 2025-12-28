'use client';

interface CryptoKeyPair {
  key: string;
}

export async function requestKeyGeneration(): Promise<CryptoKeyPair> {
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

    return response.json() as Promise<CryptoKeyPair>;
  } catch (error) {
    throw new Error(
      `Failed to generate key pair: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
