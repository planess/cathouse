import { createElement } from 'react';

import { ElementType } from '../../models/element-type';
import { FormFieldTag } from '../../models/form-field-tag';

export default function FormField<T extends ElementType>({
  label,
  hint,
  config,
  errors,
  element,
}: FormFieldTag<T>) {
  const Element = createElement(element, {
    className: 'bg-stone-50 flex-auto py-1 px-2 rounded-md',
    ...config,
  });

  const errorHtml = (errors ?? []).map((error) => (
    <div className="flex px-2 py-[1px]" key={error}>
      <span className="basis-30 shrink-0" />
      <span className="text-rose-400 text-xs">{error}</span>
    </div>
  ));

  return (
    <div className="flex flex-col gap-1">
      <label className="flex p-[2px] rounded-lg bg-linear-to-r from-orange-100 to-zinc-50 hover:to-orange-200 items-center">
        <span className="basis-30 text-sm font-medium text-gray-700 py-1 px-2">
          {label}
        </span>

        {Element}
      </label>

      {Boolean(hint) && (
        <div className="flex px-[2px]">
          <span className="basis-30 shrink-0" />
          <span className="text-xs text-gray-600 px-2">{hint}</span>
        </div>
      )}

      {errorHtml.length > 0 && <div className="px-[2px]">{errorHtml}</div>}
    </div>
  );
}
