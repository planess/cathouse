import { createElement } from 'react';

import { ElementType } from '../../models/element-type';
import { FormFieldTag } from '../../models/form-field-tag';
import FormField from '../form-field/form-field';

export default function InputField<T extends ElementType>({
  label,
  hint,
  config,
  errors,
  element,
}: FormFieldTag<T>) {
  const Element = createElement(element, {
    ...config,
    className:
      'bg-stone-50 flex-auto py-1 px-2 rounded-md dark:bg-stone-700 dark:text-stone-50',
  });

  return (
    <FormField Element={Element} label={label} hint={hint} errors={errors} />
  );
}
