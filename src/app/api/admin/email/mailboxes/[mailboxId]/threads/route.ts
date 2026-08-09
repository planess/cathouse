import { NextResponse } from 'next/server';

import { PAGE_THREAD_SIZE } from '@app/(admin)/admin/email/constants/page-thread-size';
import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasAnyPermission } from '@app/services/access-verification.service';
import { emailService } from '@app/services/email.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mailboxId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id)
    return NextResponse.json(
      { message: 'User not authenticated.' },
      { status: 401 },
    );
  if (
    !(await hasAnyPermission(
      [SYSTEM_PERMISSIONS.EMAIL_READ, SYSTEM_PERMISSIONS.EMAIL_SEND],
      undefined,
      user.id,
    ))
  ) {
    return NextResponse.json(
      { message: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  const { mailboxId } = await params;
  const search = new URL(request.url).searchParams;
  const requestedPage = Number(search.get('page') ?? '1');
  const requestedPageSize = Number(
    search.get('pageSize') ?? `${PAGE_THREAD_SIZE}`,
  );
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize =
    Number.isInteger(requestedPageSize) && requestedPageSize > 0
      ? requestedPageSize
      : PAGE_THREAD_SIZE;
  const result = await emailService.listThreadsPageByMailbox(
    mailboxId,
    page,
    pageSize,
  );

  return NextResponse.json(result);
}
