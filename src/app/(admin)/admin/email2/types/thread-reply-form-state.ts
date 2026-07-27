import type { RecipientFormValue } from './recipient-form-value';

export type ThreadReplyFormState = {
  to: RecipientFormValue[];
  cc: RecipientFormValue[];
  bcc: RecipientFormValue[];
  bodyHtml: string;
};
