import { createElement } from 'react';

import FormField, {
  FormFieldProps,
} from '@app/(guest)/components/form-field/form-field';

interface CustomFieldProps extends FormFieldProps {
  children: ReturnType<typeof createElement>;
}

export default function CustomField({
  label,
  hint,
  errors,
  children,
}: CustomFieldProps) {
  return (
    <FormField label={label} hint={hint} errors={errors} Element={children} />
  );
}
