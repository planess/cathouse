import { cookies as nextCookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookies = await nextCookies();
  const { token } = (await request.json()) as { token: string };

  cookies.set('token', token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: true,
    httpOnly: true,
    priority: 'high',
  });

  return new NextResponse();
}
