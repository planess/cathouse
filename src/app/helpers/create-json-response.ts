import { NextResponse } from 'next/server';

export function createJsonResponse<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}
