import { JSX } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { FormFieldErrorMessage } from '@app/models/form-field-error-message';

import { ElementType } from './element-type';

export interface FormFieldTag<T extends ElementType> {
  label: string;
  hint?: string;
  config: UseFormRegisterReturn & JSX.IntrinsicElements[T];
  element: T;
  errors?: FormFieldErrorMessage[];
}
