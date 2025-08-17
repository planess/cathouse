import { hashBlake2, hashBlake2Alternative } from './hash-blake2';

/**
 * Example usage of Blake2b hashing functions
 */
export async function hashExample() {
  const data = 'password123';
  const salt = 'randomSaltValue';
  
  try {
    // Hash using the main function
    const hash1 = await hashBlake2(data, salt);
    console.log('Hash 1:', hash1);
    
    // Hash using the alternative function
    const hash2 = await hashBlake2Alternative(data, salt);
    console.log('Hash 2:', hash2);
    
    // Verify the same input produces the same hash
    const hash1Again = await hashBlake2(data, salt);
    console.log('Hash 1 again:', hash1Again);
    console.log('Hashes match:', hash1 === hash1Again);
    
    return { hash1, hash2, matches: hash1 === hash1Again };
  } catch (error) {
    console.error('Hashing failed:', error);
    throw error;
  }
}

/**
 * Hash a password with salt for storage
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  return await hashBlake2(password, salt);
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashBlake2(password, salt);
  
  return computedHash === storedHash;
}
