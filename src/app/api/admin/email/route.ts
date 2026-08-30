import { createJsonResponse } from '@app/helpers/create-json-response';
import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { emailService } from '@app/services/email.service';

export const runtime = 'nodejs';

type EmailRecipient = {
  name: string;
  email: string;
};

const ALLOWED_CONTEXT_PATTERN = /^[\w.-]+$/;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_ATTACHMENTS = 10;

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return createJsonResponse({ success: false, message: 'User not authenticated.' }, 401);
  }

  const canSendEmail = await hasPermission(
    SYSTEM_PERMISSIONS.EMAIL_SEND,
    undefined,
    currentUser.id,
  );

  if (!canSendEmail) {
    return createJsonResponse({ success: false, message: 'Insufficient permissions.' }, 403);
  }

  try {
    const formData = await request.formData();

    const recipientsRaw = formData.get('recipients');
    const senderContext =
      (formData.get('senderContext') as string)?.trim() || 'info';
    const subject = (formData.get('subject') as string)?.trim();
    const body = (formData.get('body') as string)?.trim();

    if (!ALLOWED_CONTEXT_PATTERN.test(senderContext)) {
      return createJsonResponse({ success: false, message: 'Invalid sender context.' }, 400);
    }

    if (recipientsRaw === null || typeof recipientsRaw !== 'string') {
      return createJsonResponse({ success: false, message: 'Recipients are required.' }, 400);
    }

    let recipients: EmailRecipient[];

    try {
      recipients = JSON.parse(recipientsRaw) as EmailRecipient[];
    } catch {
      return createJsonResponse({ success: false, message: 'Invalid recipients data.' }, 400);
    }

    const validRecipients = recipients.filter((recipient) =>
      recipient.email.trim(),
    );

    if (validRecipients.length === 0) {
      return createJsonResponse(
        {
          success: false,
          message: 'At least one recipient email is required.',
        },
        400,
      );
    }

    if (!subject) {
      return createJsonResponse({ success: false, message: 'Subject is required.' }, 400);
    }

    if (!body) {
      return createJsonResponse({ success: false, message: 'Email body is required.' }, 400);
    }

    const attachmentFiles = formData
      .getAll('attachments')
      .filter((entry): entry is File => entry instanceof File);

    if (attachmentFiles.length > MAX_ATTACHMENTS) {
      return createJsonResponse(
        {
          success: false,
          message: `Maximum ${MAX_ATTACHMENTS} attachments allowed.`,
        },
        400,
      );
    }

    const attachments = await Promise.all(
      attachmentFiles
        .filter((file) => file.size > 0)
        .map(async (file) => {
          if (file.size > MAX_ATTACHMENT_SIZE) {
            throw new Error(`File ${file.name} exceeds 10MB limit.`);
          }

          return {
            data: Buffer.from(await file.arrayBuffer()),
            filename: file.name,
          };
        }),
    );

    const toAddresses = validRecipients.map((recipient) =>
      recipient.name.trim()
        ? `${recipient.name.trim()} <${recipient.email.trim()}>`
        : recipient.email.trim(),
    );

    const result = await emailService.sendEmail(
      toAddresses,
      subject,
      body,
      senderContext,
      attachments,
    );

    if (result.status !== 200) {
      return createJsonResponse({ success: false, message: 'Failed to send email.' }, 502);
    }

    return createJsonResponse({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('exceeds 10MB limit')
    ) {
      return createJsonResponse({ success: false, message: error.message }, 400);
    }

    console.error('Failed to send admin email:', error);

    return createJsonResponse({ success: false, message: 'Failed to send email.' }, 500);
  }
}
