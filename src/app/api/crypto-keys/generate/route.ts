import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import clientPromise from '../../../ins/mongo-client';

export async function POST() {
  try {
    // Generate RSA key pair on the server
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const keyPairData = {
      id: crypto.randomUUID(),
      publicKey,
      privateKey,
      createdAt: new Date(),
      algorithm: 'RSA-2048',
    };

    // Save to database
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('security');

    const result = await collection.insertOne(keyPairData);

    // Return only the public key to the client (private key stays on server)
    return NextResponse.json({
      id: result.insertedId.toString(),
      publicKey: keyPairData.publicKey,
      createdAt: keyPairData.createdAt,
      algorithm: keyPairData.algorithm,
    });
  } catch {
    // console.error('Error generating crypto key pair:', error);
    return NextResponse.json(
      { error: 'Failed to generate key pair' },
      { status: 500 },
    );
  }
}
