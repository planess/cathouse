import { AccountFormState } from '../account-form-state';

export type AccountFormProps = {
  initialState: AccountFormState;
  onChange: (state: AccountFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};
