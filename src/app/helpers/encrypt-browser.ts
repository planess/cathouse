/**
 * Utility function to encrypt data using the public key
 * This should be used with the cryptoKey from useCryptoKey()
 */
export async function encrypt(
  cryptoKey: CryptoKey,
  data: string,
): Promise<string> {
  try {
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      cryptoKey,
      dataBuffer,
    );

    // Convert to base64 string
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const encryptedString = btoa(String.fromCharCode(...encryptedArray));

    return encryptedString;
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
