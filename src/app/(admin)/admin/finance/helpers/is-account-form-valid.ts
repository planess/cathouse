import { AccountFormState } from '../models/account-form-state';
import { TranslationFn } from '../models/transform-fn';

import { validateAccountForm } from './validate-account-form';

export function isAccountFormValid(state: AccountFormState, t: TranslationFn) {
  return Object.keys(validateAccountForm(state, t)).length === 0;
}
