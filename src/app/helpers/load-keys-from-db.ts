/**
 * Load keys from database
 */
export async function loadKeysFromDB(): Promise<CryptoKeyPair[]> {
  try {
    const response = await fetch('/api/crypto-keys');

    if (!response.ok) {
      throw new Error(`Failed to load keys: ${response.statusText}`);
    }

    return response.json();
  } catch {
    // console.error('Error loading keys from database:', error);
    return [];
  }
}
