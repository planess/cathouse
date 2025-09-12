import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '@app/ins/mongo-client';
import { User } from '@app/models/user';

export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  const token = cookies.get('token')?.value;

  if (
    token === null ||
    token === undefined ||
    typeof token !== 'string' ||
    token.length <= 0
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const activeSession = await db.collection('sessions').findOne({ token });

  if (!activeSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const record = await db
    .collection('users')
    .findOne(
      { id: activeSession.userId },
      { projection: { _id: 0, password: 0 } },
    );

  if (!record) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // check permissions or 403 error

  const user = {
    id: record.id,
    email: record.email,
    name: record.name,
    scopes: [],
    createdAt: record.createdAt,
    lastLogin: activeSession.createdAt,
  } as User;

  return NextResponse.json({ user });
}
