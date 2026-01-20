'use client';

import { useId } from 'react';

type HealthSliderProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
  min?: number;
  max?: number;
};

export function HealthSlider({
  value,
  onChange,
  label,
  description,
  min = 1,
  max = 10,
}: HealthSliderProps) {
  const sliderId = useId();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor={sliderId}
          className="text-sm font-medium text-slate-900 dark:text-slate-200"
        >
          {label}
        </label>
        <span className="rounded-full bg-slate-900/10 px-3 py-0.5 text-xs font-semibold text-slate-900 dark:bg-stone-200 dark:text-slate-700">
          {value}
        </span>
      </div>

      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {description}
        </p>
      )}

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900 dark:bg-stone-700 dark:accent-slate-200"
      />

      <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-400">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(
          (mark) => (
            <span key={mark}>{mark}</span>
          ),
        )}
      </div>
    </div>
  );
}
