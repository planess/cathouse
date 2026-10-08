import clsx from 'clsx';
import { useId } from 'react';

import type { SigninInputFieldProps } from '../../models/signin-input-field-props';

/**
 * Stacked label-over-input field used by the sign-in form.
 *
 * @param props - Field props.
 * @param props.label - Visible label text.
 * @param props.config - Props forwarded to the underlying input.
 * @param props.errors - Validation messages shown under the input.
 * @param props.labelAside - Content rendered at the end of the label row.
 * @param props.trailing - Control rendered inside the input on its trailing edge.
 */
export default function SigninInputField({
  label,
  config,
  errors,
  labelAside,
  trailing,
}: SigninInputFieldProps) {
  const generatedId = useId();
  const id = config.id ?? generatedId;
  const errorId = `${id}-error`;
  const hasErrors = (errors ?? []).length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>

        {labelAside}
      </div>

      <div className="relative flex">
        <input
          {...config}
          id={id}
          aria-invalid={hasErrors || undefined}
          aria-describedby={hasErrors ? errorId : undefined}
          className={clsx(
            'h-12 lg:h-11 grow min-w-0 rounded-md border bg-white dark:bg-stone-800 px-3 text-base text-slate-900 dark:text-stone-50 placeholder:text-slate-400 dark:placeholder:text-stone-500 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-sky-600',
            trailing && 'pr-12',
            hasErrors
              ? 'border-rose-400 dark:border-rose-500'
              : 'border-slate-300 dark:border-stone-600',
          )}
        />

        {trailing}
      </div>

      {hasErrors && (
        <div id={errorId} className="flex flex-col gap-0.5">
          {(errors ?? []).map((error) => (
            <span
              key={error}
              className="text-sm text-rose-700 dark:text-rose-400"
            >
              {error}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
