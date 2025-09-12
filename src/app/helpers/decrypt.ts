import { privateDecrypt, constants } from 'node:crypto';

/**
 * Decrypt base64 encrypted data using RSA private key
 */
export function decrypt(privateKeyPem: string, encryptedData: string): string {
  try {
    // Decode base64 encrypted data back to buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');

    // Decrypt using RSA private key
    const decryptedBuffer = privateDecrypt(
      {
        key: privateKeyPem,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encryptedBuffer,
    );

    // Convert buffer back to string
    return decryptedBuffer.toString('utf8');
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
