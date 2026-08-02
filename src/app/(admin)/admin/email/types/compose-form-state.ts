import type { RecipientFormValue } from './recipient-form-value';

export type ComposeFormState = {
  to: RecipientFormValue[];
  cc: RecipientFormValue[];
  bcc: RecipientFormValue[];
  subject: string;
  bodyHtml: string;
};
