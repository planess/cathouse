'use client';

import clsx from 'clsx';
import { useId, useState } from 'react';

import { ComponentsCheckboxGroupCheckboxGroupIcon01 } from '@app/components/icons/components-checkbox-group-checkbox-group-icon-01';
import type { CheckboxGroupProps } from '@app/models/checkbox-group-props.model';

export function CheckboxGroup({
  options,
  value,
  defaultValue,
  name,
  id,
  direction = 'horizontal',
  disabled = false,
  className,
  optionClassName,
  onChange,
}: CheckboxGroupProps) {
  const generatedId = useId();
  const groupName = name ?? id ?? generatedId;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(
    defaultValue ?? [],
  );
  const selectedValues = isControlled ? value : internalValue;
  const selectedSet = new Set(selectedValues);

  const handleChange = (nextValue: string, checked: boolean) => {
    const nextSelected = checked
      ? [...selectedValues, nextValue]
      : selectedValues.filter((item) => item !== nextValue);

    if (!isControlled) {
      setInternalValue(nextSelected);
    }

    onChange?.(nextSelected);
  };

  return (
    <div
      className={clsx(
        'flex border border-slate-300 rounded-xl',
        direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
        className,
      )}
      role="group"
      aria-disabled={disabled}
    >
      {options.map((option, idx) => {
        const optionId = `${groupName}-${option.value}`;
        const isOptionDisabled = disabled || option.disabled;
        const isChecked = selectedSet.has(option.value);

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={clsx(
              'flex-1 group relative min-w-28 p-3 transition',
              'border-slate-300 bg-transparent',
              'hover:border-sky-300 hover:bg-sky-50/60',
              'has-checked:border-sky-300 has-checked:bg-sky-100 has-checked:text-sky-900',
              'has-focus-visible:outline-2 has-focus-visible:outline-sky-300 has-focus-visible:outline-offset-2',
              isOptionDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer',
              optionClassName,
              {
                'border-r border-slate-200':
                  direction === 'horizontal' && idx < options.length - 1,
                'border-b border-slate-200':
                  direction === 'vertical' && idx < options.length - 1,
                'rounded-l-xl': direction === 'horizontal' && idx === 0,
                'rounded-r-xl':
                  direction === 'horizontal' && idx === options.length - 1,
                'rounded-t-xl': direction === 'vertical' && idx === 0,
                'rounded-b-xl':
                  direction === 'vertical' && idx === options.length - 1,
              },
            )}
          >
            <input
              id={optionId}
              name={groupName}
              value={option.value}
              type="checkbox"
              className="sr-only"
              checked={isChecked}
              disabled={isOptionDisabled}
              onChange={(event) =>
                handleChange(option.value, event.target.checked)
              }
            />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700 transition-colors group-has-checked:text-sky-900">
                  {option.label}
                </p>
                {option.description ? (
                  <p className="text-xs text-slate-500 transition-colors group-has-checked:text-sky-700">
                    {option.description}
                  </p>
                ) : null}
              </div>
              <span
                aria-hidden
                className={clsx(
                  'mt-0.5 flex h-4 w-4 items-center justify-center rounded-sm border transition',
                  isChecked
                    ? 'border-sky-500 bg-sky-500 shadow-[0_0_0_2px_rgba(255,255,255,0.95)_inset]'
                    : 'border-slate-300 bg-transparent',
                )}
              >
                <ComponentsCheckboxGroupCheckboxGroupIcon01
                  viewBox="0 0 20 20"
                  className={clsx(
                    'h-3 w-3 text-white transition-opacity',
                    isChecked ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
