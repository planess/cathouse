export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
  name?: string;
  id?: string;
  onChange?: (checked: boolean) => void;
}
