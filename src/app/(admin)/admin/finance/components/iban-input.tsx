'use client';

import { useMemo } from 'react';

import { IbanInputProps } from '../models/props/iban-input-props';

const IBAN_REGEX = /^[A-Z]{2}\d{27}$/;
const IBAN_MAX_LENGTH = 29;
const IBAN_GROUPS = [4, 6, 5, 4, 4, 4, 2];

export function isValidIban(value: string) {
  return IBAN_REGEX.test(value);
}

export function normalizeIban(value: string) {
  return value
    .replaceAll(/[^\dA-Za-z]/g, '')
    .toUpperCase()
    .slice(0, IBAN_MAX_LENGTH);
}

export function formatIban(value: string) {
  const normalized = normalizeIban(value);
  const groups: string[] = [];
  let cursor = 0;

  for (const size of IBAN_GROUPS) {
    if (cursor >= normalized.length) {
      break;
    }

    groups.push(normalized.slice(cursor, cursor + size));
    cursor += size;
  }

  if (cursor < normalized.length) {
    groups.push(normalized.slice(cursor));
  }

  return groups.join(' ');
}

export function IbanInput({
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  isInvalid,
}: IbanInputProps) {
  const formattedValue = useMemo(() => formatIban(value), [value]);
  const hasLabel = Boolean(label?.trim());
  const invalid = isInvalid === true;

  return (
    <div className="space-y-2">
      {hasLabel ? (
        <label className="text-xs font-semibold text-slate-600">{label}</label>
      ) : null}
      <input
        className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
          invalid ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
        }`}
        value={formattedValue}
        onChange={(event) => onChange(normalizeIban(event.target.value))}
        onBlur={onBlur}
        type="text"
        placeholder={placeholder ?? 'UA88 322001 00000 2600 2700 0084 46'}
        inputMode="text"
        autoComplete="off"
      />
    </div>
  );
}
