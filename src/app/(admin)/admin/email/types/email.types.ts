export type EmailRecipient = {
  name: string;
  email: string;
};

export type EmailFormState = {
  recipients: EmailRecipient[];
  senderContext: string;
  subject: string;
  body: string;
};

export type EmailViewProps = {
  userEmail: string;
};
