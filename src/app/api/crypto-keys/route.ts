import { NextResponse } from 'next/server';

import clientPromise from '../../ins/mongo-client';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('security');

    const keys = await collection.find({}).toArray();

    // Convert dates back to proper format
    const formattedKeys = keys.map((key) => ({
      ...key,
      createdAt: new Date(key.createdAt),
      _id: key._id.toString(), // Convert ObjectId to string
    }));

    return NextResponse.json(formattedKeys);
  } catch {
    // console.error('Error fetching crypto keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto keys' },
      { status: 500 },
    );
  }
}
