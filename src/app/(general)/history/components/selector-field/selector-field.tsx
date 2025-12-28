import { createElement, JSX } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import FormField, {
  FormFieldProps,
} from '@app/(guest)/components/form-field/form-field';

interface SelectorFieldProps extends FormFieldProps {
  options: { value: string; label: string }[];
  config: UseFormRegisterReturn & JSX.IntrinsicElements['select'];
}

export default function SelectorField({
  label,
  hint,
  errors,
  options,
  config,
}: SelectorFieldProps) {
  const Element = createElement(
    'select',
    {
      ...config,
      className: 'bg-stone-50 flex-auto py-1 px-2 rounded-md',
    },
    options.map(({ label, value }) =>
      createElement('option', { value, key: value }, label),
    ),
  );

  return (
    <FormField label={label} hint={hint} errors={errors} Element={Element} />
  );
}
