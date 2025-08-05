import clsx from 'clsx';

interface ButtonProps {
  disabled: boolean;
  className: string;
}

export function Button({
  disabled,
  children,
  className,
}: Partial<ButtonProps> & { children: string }) {
  return (
    <button
      className={clsx(
        className,
        'px-6 py-2 font-semibold rounded-lg shadow-md transition',
        {
          'bg-blue-400 text-stone-100 hover:bg-blue-500 focus:outline-2 focus:outline-blue-300 focus:outline-offset-2 focus:outline-solid active:bg-blue-600 active:text-stone-200':
            !disabled,
          'bg-neutral-200 text-gray-400': disabled,
        },
      )}
      type="submit"
      disabled={disabled}
    >
      {children}
    </button>
  );
}
