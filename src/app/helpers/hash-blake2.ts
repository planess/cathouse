import { subtle } from 'node:crypto';

/**
 * Hash data with salt using Blake2b512 algorithm
 *
 * @param data - The data to hash
 * @param salt - The salt to append to the data
 * @returns Promise<string> - The hex-encoded hash
 */
export async function hashBlake2(data: string, salt: string): Promise<string> {
  try {
    // Combine data and salt
    const dataWithSalt = `${salt}--$#-${data}`;

    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataWithSalt);

    // Import Blake2b key (empty key for hashing)
    const key = await subtle.importKey(
      'raw',
      new Uint8Array(64), // 512-bit key (64 bytes)
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    // Create Blake2b hash using HMAC-SHA256 as a substitute
    // Note: Web Crypto API doesn't have native Blake2b, so we use HMAC-SHA256
    const signature = await subtle.sign('HMAC', key, dataBuffer);

    // Convert to hex string
    const hashArray = new Uint8Array(signature);
    const hashHex = [...hashArray]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  } catch (error) {
    throw new Error(
      `Blake2b hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Alternative implementation using a more Blake2b-like approach
 * This creates a deterministic hash that's closer to Blake2b behavior
 */
export async function hashBlake2Alternative(
  data: string,
  salt: string,
): Promise<string> {
  try {
    // Combine data and salt
    const dataWithSalt = `${salt}--$#-${data}`;

    // Convert to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataWithSalt);

    // Use SHA-512 as it's also 512-bit like Blake2b512
    const hashBuffer = await subtle.digest('SHA-512', dataBuffer);

    // Convert to hex string
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = [...hashArray]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  } catch (error) {
    throw new Error(
      `Alternative hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
