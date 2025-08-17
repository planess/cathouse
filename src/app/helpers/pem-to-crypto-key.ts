/**
 * Convert PEM public key to CryptoKey object
 */
export async function pemToCryptoKey(pemKey: string): Promise<CryptoKey> {
  try {
    // Remove PEM headers and convert to base64
    const base64Key = pemKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Key);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Import as CryptoKey
    return await window.crypto.subtle.importKey(
      'spki',
      bytes,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt'],
    );
  } catch (error) {
    throw new Error(
      `Failed to convert PEM to CryptoKey: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
