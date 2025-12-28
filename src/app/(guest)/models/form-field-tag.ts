import { JSX } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { FormFieldProps } from '../components/form-field/form-field';

import { ElementType } from './element-type';

export interface FormFieldTag<T extends ElementType> extends FormFieldProps {
  element: T;
  config: UseFormRegisterReturn & JSX.IntrinsicElements[T];
}
