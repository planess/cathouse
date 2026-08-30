import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasAnyPermission } from '@app/services/access-verification.service';
import type { EmailAttachmentDocument } from '@app/services/email/document-types';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return new NextResponse(null, { status: 401 });
  }

  const canReadEmail = await hasAnyPermission(
    [SYSTEM_PERMISSIONS.EMAIL_READ, SYSTEM_PERMISSIONS.EMAIL_SEND],
    undefined,
    currentUser.id,
  );

  if (!canReadEmail) {
    return new NextResponse(null, { status: 403 });
  }

  const { attachmentId } = await params;

  if (!ObjectId.isValid(attachmentId)) {
    return new NextResponse(null, { status: 404 });
  }

  const dbClient = await clientPromise;
  const attachment = await dbClient
    .db()
    .collection<EmailAttachmentDocument>(DbTables.emailAttachments)
    .findOne({ _id: new ObjectId(attachmentId) });

  if (attachment?.storageKey === undefined) {
    return new NextResponse(null, { status: 404 });
  }

  const publicBaseUrl = process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL;
  const endpoint = process.env.CLOUDFLARE_S3_ENDPOINT;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const baseUrl = publicBaseUrl?.trim() || `${endpoint}/${bucket}`;

  return NextResponse.redirect(
    new URL(`${baseUrl.replace(/\/$/, '')}/${attachment.storageKey}`),
  );
}
