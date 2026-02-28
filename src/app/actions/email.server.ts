'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';
import { emailService } from '@app/services/email.service';

type EmailRecipient = {
  name: string;
  email: string;
};

const ALLOWED_CONTEXT_PATTERN = /^[\w.-]+$/;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_ATTACHMENTS = 10;

export async function sendFoundationEmail(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return { success: false, message: 'User not authenticated.' };
  }

  await requirePermission(
    SYSTEM_PERMISSIONS.EMAIL_SEND,
    undefined,
    currentUser.id,
  );

  const recipientsRaw = formData.get('recipients');
  const senderContext = (formData.get('senderContext') as string)?.trim() || 'info';
  const subject = (formData.get('subject') as string)?.trim();
  const body = (formData.get('body') as string)?.trim();

  if (!ALLOWED_CONTEXT_PATTERN.test(senderContext)) {
    return { success: false, message: 'Invalid sender context.' };
  }

  if (recipientsRaw === null || typeof recipientsRaw !== 'string') {
    return { success: false, message: 'Recipients are required.' };
  }

  let recipients: EmailRecipient[];
  try {
    recipients = JSON.parse(recipientsRaw) as EmailRecipient[];
  } catch {
    return { success: false, message: 'Invalid recipients data.' };
  }

  const validRecipients = recipients.filter((r) => r.email.trim());
  if (validRecipients.length === 0) {
    return { success: false, message: 'At least one recipient email is required.' };
  }

  if (!subject) {
    return { success: false, message: 'Subject is required.' };
  }

  if (!body) {
    return { success: false, message: 'Email body is required.' };
  }

  const attachmentFiles = formData.getAll('attachments') as File[];
  if (attachmentFiles.length > MAX_ATTACHMENTS) {
    return { success: false, message: `Maximum ${MAX_ATTACHMENTS} attachments allowed.` };
  }

  const attachments = await Promise.all(
    attachmentFiles
      .filter((f) => f.size > 0)
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

  const toAddresses = validRecipients.map((r) =>
    r.name.trim() ? `${r.name.trim()} <${r.email.trim()}>` : r.email.trim(),
  );

  const result = await emailService.sendEmail(
    toAddresses,
    subject,
    body,
    senderContext,
    attachments,
  );

  if (result.status !== 200) {
    return { success: false, message: 'Failed to send email.' };
  }

  revalidatePath('/admin/email');

  return { success: true, message: 'Email sent successfully.' };
}
