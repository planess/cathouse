import type { EmailThreadSummary } from '@app/services/email.service';

export type SendEmailResponse = {
  success: boolean;
  message: string;
  thread?: EmailThreadSummary;
};
