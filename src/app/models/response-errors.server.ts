import { FormFieldErrorMessage } from './form-field-error-message';
import { FormFieldID } from './form-field-id';

export type ResponseErrors = Record<FormFieldID, FormFieldErrorMessage[]>;
