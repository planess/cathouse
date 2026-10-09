import type { InputHTMLAttributes, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

/** Props of the input field used by the guest (auth) forms. */
export interface AuthInputFieldProps {
  /** Visible label text. */
  label: string;
  /** Props forwarded to the underlying `input`, including react-hook-form registration. */
  config: UseFormRegisterReturn & InputHTMLAttributes<HTMLInputElement>;
  /** Helper text shown under the input. */
  hint?: string;
  /** Validation messages shown under the input. */
  errors?: string[];
  /** Optional content rendered at the end of the label row (e.g. a link). */
  labelAside?: ReactNode;
  /** Optional control rendered inside the input on its trailing edge (e.g. a toggle button). */
  trailing?: ReactNode;
}
