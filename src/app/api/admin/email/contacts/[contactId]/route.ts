import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

/** Verifies that the current user may modify email contacts. */
async function authorizeContactChange() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return {
      response: NextResponse.json(
        { success: false, message: 'User not authenticated.' },
        { status: 401 },
      ),
      user: null,
    };
  }

  if (
    !(await hasPermission(
      SYSTEM_PERMISSIONS.EMAIL_SEND,
      undefined,
      user.id,
    ))
  ) {
    return {
      response: NextResponse.json(
        { success: false, message: 'Insufficient permissions.' },
        { status: 403 },
      ),
      user: null,
    };
  }

  return { response: null, user };
}

/** Updates the display name of an email contact. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> },
) {
  const authorization = await authorizeContactChange();

  if (authorization.response !== null || authorization.user === null) {
    return authorization.response;
  }

  const { contactId } = await params;

  try {
    const payload = (await request.json()) as { name?: unknown };

    if (typeof payload.name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid contact name.' },
        { status: 400 },
      );
    }

    const contact = await emailService.updateEmailContactName(
      contactId,
      payload.name,
    );

    return NextResponse.json({
      success: true,
      message: 'Contact updated.',
      contact,
    });
  } catch (error) {
    return handleContactChangeError(
      error,
      contactId,
      authorization.user.id.toString(),
      'update',
    );
  }
}

/** Deletes an unreferenced email contact. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ contactId: string }> },
) {
  const authorization = await authorizeContactChange();

  if (authorization.response !== null || authorization.user === null) {
    return authorization.response;
  }

  const { contactId } = await params;

  try {
    await emailService.deleteEmailContact(contactId);

    return NextResponse.json({
      success: true,
      message: 'Contact deleted.',
    });
  } catch (error) {
    return handleContactChangeError(
      error,
      contactId,
      authorization.user.id.toString(),
      'delete',
    );
  }
}

/** Converts a contact mutation error into an API response. */
async function handleContactChangeError(
  error: unknown,
  contactId: string,
  userId: string,
  action: 'delete' | 'update',
) {
  const message =
    error instanceof Error ? error.message : `Failed to ${action} contact.`;
  const status =
    message === 'Invalid contact id.'
      ? 400
      : message === 'Contact not found.'
        ? 404
        : message === 'Contact is referenced by email history.'
          ? 409
          : 500;

  await logDevelopmentError(`email.api.contacts.${action}`, error, {
    contactId,
    route: '/api/admin/email/contacts/[contactId]',
    status,
    userId,
  });

  return NextResponse.json({ success: false, message }, { status });
}
