'use client';

import clsx from 'clsx';
import { useId, useState } from 'react';

import { ComponentsCheckboxCheckboxIcon01 } from '@app/components/icons/components-checkbox-checkbox-icon-01';
import type { CheckboxProps } from '@app/models/checkbox-props.model';

export function Checkbox({
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  className,
  name,
  id,
  onChange,
}: CheckboxProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;
  const reactId = useId();
  const inputId = id ?? reactId;

  const handleChange = (nextValue: boolean) => {
    if (!isControlled) {
      setInternalChecked(nextValue);
    }

    onChange?.(nextValue);
  };

  return (
    <label
      htmlFor={inputId}
      className={clsx(
        'inline-flex items-center gap-2 select-none',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className,
      )}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <input
          id={inputId}
          name={name}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={(event) => handleChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={clsx(
            'h-5 w-5 rounded border-2 transition-colors',
            'border-neutral-300 bg-white',
            'peer-checked:border-blue-500 peer-checked:bg-blue-500',
            'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-400 peer-focus-visible:outline-offset-2',
          )}
        />
        <ComponentsCheckboxCheckboxIcon01
          viewBox="0 0 20 20"
          className={clsx(
            'pointer-events-none absolute h-3.5 w-3.5 text-white transition-opacity',
            isChecked ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden
        />
      </span>
      {label ? (
        <span className="text-sm text-neutral-700 dark:text-slate-200">
          {label}
        </span>
      ) : null}
    </label>
  );
}
