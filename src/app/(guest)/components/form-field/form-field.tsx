import { createElement } from 'react';

import { FormFieldErrorMessage } from '@app/models/form-field-error-message';

export interface FormFieldProps {
  label: string;
  hint?: string;
  errors?: FormFieldErrorMessage[];
}

interface A extends FormFieldProps {
  Element: ReturnType<typeof createElement>;
}

export default function FormField({ Element, label, errors, hint }: A) {
  const errorHtml = (errors ?? []).map((error) => (
    <div className="flex px-2 py-[1px]" key={error}>
      <span className="basis-30 shrink-0" />
      <span className="text-rose-400 text-xs">{error}</span>
    </div>
  ));

  return (
    <div className="flex flex-col gap-1">
      <label className="flex p-0.5 rounded-lg bg-linear-to-r from-orange-100 to-zinc-50 hover:to-orange-200 items-center">
        <span className="basis-30 text-sm font-medium text-gray-700 py-1 px-2">
          {label}
        </span>

        {Element}
      </label>

      {Boolean(hint) && (
        <div className="flex px-0.5">
          <span className="basis-30 shrink-0" />
          <span className="text-xs text-gray-600 px-2">{hint}</span>
        </div>
      )}

      {errorHtml.length > 0 && <div className="px-0.5">{errorHtml}</div>}
    </div>
  );
}
