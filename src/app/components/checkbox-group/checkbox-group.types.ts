import { ReactNode } from 'react';

export type CheckboxGroupDirection = 'horizontal' | 'vertical';

export interface CheckboxGroupOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  value?: string[];
  defaultValue?: string[];
  name?: string;
  id?: string;
  direction?: CheckboxGroupDirection;
  disabled?: boolean;
  className?: string;
  optionClassName?: string;
  onChange?: (value: string[]) => void;
}
