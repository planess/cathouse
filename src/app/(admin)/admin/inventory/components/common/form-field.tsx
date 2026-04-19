import type { FormFieldProps } from '../../types/inventory-component-props.types';

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600">
        {label}
        {required === true ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {(error ?? '').length > 0 ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}
