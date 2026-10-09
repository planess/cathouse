/** Props of the full-width submit button of a guest (auth) form. */
export interface AuthSubmitButtonProps {
  /** Whether the button cannot be pressed. */
  disabled?: boolean;
  /** Whether the form is being submitted; shows a spinner and disables the button. */
  pending?: boolean;
  /** Button text. */
  children: string;
}
