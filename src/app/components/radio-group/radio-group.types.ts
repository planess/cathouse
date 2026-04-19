import { ReactNode } from 'react';

export type RadioGroupDirection = 'horizontal' | 'vertical';

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  direction?: RadioGroupDirection;
  disabled?: boolean;
  className?: string;
  optionClassName?: string;
  onChange?: (value: string) => void;
}
