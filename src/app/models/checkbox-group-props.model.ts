import type { CheckboxGroupDirection } from './checkbox-group-direction.model';
import type { CheckboxGroupOption } from './checkbox-group-option.model';

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
