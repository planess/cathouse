import type { ComposeFormState } from '../types/compose-form-state';

export const defaultComposeForm: ComposeFormState = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  bodyHtml: '',
};
