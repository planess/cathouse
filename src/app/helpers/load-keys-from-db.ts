/**
 * Load keys from database
 */
export async function loadKeysFromDB(): Promise<{ key: string | null }> {
  try {
    const response = await fetch('/api/crypto-keys');

    if (!response.ok) {
      throw new Error(`Failed to load keys: ${response.statusText}`);
    }

    return response.json() as Promise<{ key: string | null }>;
  } catch {
    // console.error('Error loading keys from database:', error);
    return { key: null };
  }
}
