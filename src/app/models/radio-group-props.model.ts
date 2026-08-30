import type { RadioGroupDirection } from './radio-group-direction.model';
import type { RadioGroupOption } from './radio-group-option.model';

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
