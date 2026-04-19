'use client';

import clsx from 'clsx';
import { useId, useState } from 'react';

import { RadioGroupProps } from './radio-group.types';

export function RadioGroup({
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
}: RadioGroupProps) {
  const generatedId = useId();
  const groupName = name ?? id ?? generatedId;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const selectedValue = isControlled ? value : internalValue;

  const handleChange = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  return (
    <div
      className={clsx(
        'flex border border-slate-300 rounded-xl',
        direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
        className,
      )}
      role="radiogroup"
      aria-disabled={disabled}
    >
      {options.map((option, idx) => {
        const optionId = `${groupName}-${option.value}`;
        const isOptionDisabled = disabled || option.disabled;

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
              type="radio"
              className="sr-only"
              checked={selectedValue === option.value}
              disabled={isOptionDisabled}
              onChange={() => handleChange(option.value)}
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
                  'mt-0.5 h-4 w-4 rounded-full border transition',
                  selectedValue === option.value
                    ? 'border-sky-500 bg-sky-500 shadow-[0_0_0_2px_rgba(255,255,255,0.95)_inset]'
                    : 'border-slate-300 bg-transparent',
                )}
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}
