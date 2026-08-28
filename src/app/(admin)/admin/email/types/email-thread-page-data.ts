import type {
  EmailMessageSummary,
  EmailThreadSummary,
} from '@app/services/email.service';

export type EmailThreadPageData = {
  thread: EmailThreadSummary | null;
  messages: EmailMessageSummary[];
};
