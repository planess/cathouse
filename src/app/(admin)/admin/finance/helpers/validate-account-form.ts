import { isValidIban } from '../components/iban-input';
import { AccountFormState } from '../models/account-form-state';
import { TranslationFn } from '../models/transform-fn';

export function validateAccountForm(state: AccountFormState, t: TranslationFn) {
  const errors: { name?: string; iban?: string } = {};
  const name = state.name.trim();
  const iban = state.iban.trim();

  if (!name) {
    errors.name = t('forms.account.nameRequired');
  }

  if (!iban) {
    errors.iban = t('forms.account.ibanRequired');
  } else if (!isValidIban(iban)) {
    errors.iban = t('forms.account.ibanInvalid');
  }

  return errors;
}
