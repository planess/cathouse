import { FormFieldErrorMessage } from './form-field-error-message';
import { FormFieldID } from './form-field-id';

export type ServerErrors = Record<FormFieldID, FormFieldErrorMessage[]>;
