import { createElement, JSX } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import FormField, {
  FormFieldProps,
} from '@app/(guest)/components/form-field/form-field';

interface RadioFieldProps extends FormFieldProps {
  options: { value: string; label: string }[];
  config: UseFormRegisterReturn & JSX.IntrinsicElements['input'];
}

export default function RadioField({
  label,
  hint,
  errors,
  options,
  config,
}: RadioFieldProps) {
  const Element = createElement(
    'div',
    {
      className: 'flex flex-col gap-2',
    },
    options.map(({ label, value }) =>
      createElement('label', { className: 'flex items-center', key: value }, [
        createElement('input', {
          ...config,
          type: 'radio',
          value,
          className: 'mr-2',
          key: value,
        }),
        label,
      ]),
    ),
  );

  return (
    <FormField label={label} hint={hint} errors={errors} Element={Element} />
  );
}
