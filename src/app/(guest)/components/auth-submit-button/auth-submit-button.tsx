import clsx from 'clsx';

import type { AuthSubmitButtonProps } from '../../models/auth-submit-button-props';

/**
 * Full-width submit button of a guest (auth) form.
 *
 * @param props - Button props.
 * @param props.disabled - Whether the button cannot be pressed.
 * @param props.pending - Whether the form is being submitted; shows a spinner and disables the button.
 * @param props.children - Button text.
 */
export default function AuthSubmitButton({
  disabled = false,
  pending = false,
  children,
}: AuthSubmitButtonProps) {
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending || undefined}
      className={clsx(
        'flex h-13 lg:h-12 items-center justify-center gap-2.5 rounded-lg text-base font-semibold shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
        pending
          ? 'bg-sky-700/85 text-white cursor-wait'
          : isDisabled
            ? 'bg-slate-200 dark:bg-stone-700 text-slate-400 dark:text-stone-400 shadow-none cursor-not-allowed'
            : 'bg-sky-700 text-white hover:bg-sky-800 active:bg-sky-900 cursor-pointer',
      )}
    >
      {pending && (
        <span
          aria-hidden="true"
          className="size-5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {children}
    </button>
  );
}
