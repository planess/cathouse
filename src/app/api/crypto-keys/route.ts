import { NextResponse } from 'next/server';

import clientPromise from '../../ins/mongo-client';
import { DbTables } from '@app/enum/db-tables';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(DbTables.encryption);

    // Find the most recent key sorted by createdAt
    const record = await collection.findOne({}, { sort: { createdAt: -1 } });

    if (!record) {
      return NextResponse.json(
        { error: 'No encryption keys found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      key: record.publicKey,
    });
  } catch {
    // console.error('Error fetching crypto keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto keys' },
      { status: 500 },
    );
  }
}
