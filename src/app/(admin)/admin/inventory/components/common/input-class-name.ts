export function inputClassName(error?: string) {
  const hasError = typeof error === 'string' && error.length > 0;

  return `w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
    hasError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
  }`;
}
