import { emptyRecipient } from './empty-recipient';

import type { ComposeFormState } from '../types/compose-form-state';

export const defaultComposeForm: ComposeFormState = {
  to: [{ ...emptyRecipient }],
  cc: [{ ...emptyRecipient }],
  bcc: [{ ...emptyRecipient }],
  subject: '',
  bodyHtml: '',
};
