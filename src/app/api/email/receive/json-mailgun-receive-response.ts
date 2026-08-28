import { NextResponse } from 'next/server';

import type { MailgunReceiveResponse } from './types/mailgun-receive-response';

export function jsonMailgunReceiveResponse(
  body: MailgunReceiveResponse,
  status = 200,
) {
  return NextResponse.json(body, { status });
}
