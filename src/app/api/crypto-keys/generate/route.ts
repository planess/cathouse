import crypto from 'node:crypto';

import { ObjectId } from 'mongodb';
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

    const createdAt = new Date();
    const algorithm = 'RSA-2048';

    // Save to database
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('encryption');

    const result = await collection.insertOne({
      id: crypto.randomUUID(),
      algorithm,
      publicKey,
      privateKey,
      createdAt,
      createdBy: new ObjectId(crypto.createHash('md5').update('system').digest('hex').slice(0, 24)), // todo: change to real user id
    });

    // Return only the public key to the client (private key stays on server)
    return NextResponse.json({
      key: publicKey,
    });
  } catch (error) {
    console.error('Error generating crypto key pair:', error);
    return NextResponse.json(
      { error: 'Failed to generate key pair' },
      { status: 500 },
    );
  }
}
