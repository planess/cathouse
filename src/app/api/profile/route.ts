import { NextRequest, NextResponse } from 'next/server';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import { User } from '@app/models/user';
import { getUserPermissions } from '@app/services/access-verification.service';

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

  const activeSession = await db.collection(DbTables.sessions).findOne({ token });

  if (!activeSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const record = await db
    .collection(DbTables.users)
    .findOne(
      { _id: activeSession.userID },
      { projection: { password: 0 } },
    );

  if (!record) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await db.collection(DbTables.profiles).findOne({ _id: record._id });

  // check permissions or 403 error

  const user = {
    id: record._id.toString(),
    email: record.email,
    // name: profile.name,
    scopes: await getUserPermissions(record._id),
    createdAt: record.createdAt,
    lastLogin: activeSession.createdAt,
  } as User;

  return NextResponse.json({ user });
}
